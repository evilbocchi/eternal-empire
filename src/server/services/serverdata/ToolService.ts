import { OnInit, Service } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { OnPlayerJoined } from "server/services/ModdingService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { AREAS } from "shared/constants";
import Harvestable from "shared/Harvestable";
import HarvestingTool from "shared/item/HarvestingTool";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import ReserveModels from "shared/utils/ReserveModels";

@Service()
export class ToolService implements OnInit, OnPlayerJoined, OnPlayerJoined {

    lastUsePerPlayer = new Map<Player, number>();
    originalPosPerHarvestable = new Map<Instance, Vector3>();

    constructor(private itemsService: ItemsService, private dataService: DataService) {
        
    }

    moveHarvestable(harvestable: Instance, pos: Vector3) {
        if (harvestable.IsA("Model"))
            harvestable.PivotTo(new CFrame(pos));
        else if (harvestable.IsA("BasePart"))
            harvestable.Position = pos;
    }

    getBestTools() {
        const items = this.dataService.empireData.items.inventory;
        const tools = new Map<ToolType, HarvestingTool>();
        const worse = new Array<HarvestingTool>();
        for (const [id, amount] of items) {
            const item = Items.getItem(id);
            if (item === undefined || !item.isA("HarvestingTool") || amount < 1 || item.toolType === undefined)
                continue;
            const current = tools.get(item.toolType);
            if (current === undefined || current.difficulty!.rating! < item.difficulty!.rating!) {
                tools.set(item.toolType, item);
                if (current !== undefined)
                    worse.push(current);
            }
        }
        return $tuple(tools, worse);
    }

    refreshTools(player: Player) {
        const [tools, worse] = this.getBestTools();
        const backpack = player.FindFirstChildOfClass("Backpack");
        if (backpack === undefined)
            return;
        for (const [_, tool] of tools) {
            const toolId = tool.id;
            if (player.Character?.FindFirstChild(toolId) !== undefined || backpack.FindFirstChild(toolId) !== undefined)
                continue;
            const toolModel = ReserveModels.fetchReserve(toolId);
            (toolModel as Tool).TextureId = "rbxassetid://" + tool.image;
            if (toolModel !== undefined) {
                toolModel.Parent = backpack;
            }
        }
        for (const tool of worse) {
            const holding = player.Character?.FindFirstChild(tool.id);
            if (holding !== undefined)
                holding.Destroy();
            const inInv = backpack.FindFirstChild(tool.id);
            if (inInv !== undefined)
                inInv.Destroy();
        }
    }

    isWithin(tool: Model, harvestable: Instance) {
        let position: Vector3;
        if (harvestable.IsA("Model"))
            position = harvestable.PrimaryPart!.Position;
        else if (harvestable.IsA("BasePart"))
            position = harvestable.Position;
        else
            error("Harvestable is not a BasePart or Model");
        const bladePos = ((tool.FindFirstChild("Blade") as BasePart | undefined) ?? tool.PrimaryPart)!.Position;
        const x = bladePos.X - position.X;
        const y = bladePos.Y - position.Y;
        const z = bladePos.Z - position.Z;
        if (x * x + z * z < 100 && y * y < 100)
            return true;
    }

    getCritChance(_item: HarvestingTool) {
        let critChance = 5;
        const inventory = this.dataService.empireData.items.inventory;
        for (const charm of Items.charms) {
            const amount = inventory.get(charm.id);
            if (amount !== undefined && amount > 0) {
                if (charm.criticalAdd !== undefined)
                    critChance += charm.criticalAdd;
            }
        }
        return critChance / 100;
    }

    onPlayerJoined(player: Player) {
        player.CharacterAdded.Connect((character) => {
            (character.WaitForChild("Humanoid") as Humanoid).Died.Once(() => {
                player.FindFirstChildOfClass("Backpack")?.ClearAllChildren();
            });
            this.refreshTools(player);
        });
    }

    onInit() {        
        this.itemsService.itemsBought.connect((_player, items) => {
            for (const item of items) {
                if (item.isA("HarvestingTool")) {
                    for (const player of Players.GetPlayers())
                        this.refreshTools(player);
                    break;
                }
            }
        });
        
        Packets.useTool.listen((player, harvestable) => {
            if (harvestable === undefined || harvestable === Workspace)
                return;
            const character = player.Character;
            if (character === undefined)
                return;
            const rootPart = character.FindFirstChildOfClass("Humanoid")?.RootPart;
            if (rootPart === undefined)
                return;
            const tool = character.FindFirstChildOfClass("Tool");
            if (tool === undefined || this.isWithin(tool, harvestable) !== true)
                return;
            const item = Items.getItem(tool.Name);
            if (item === undefined || !item.isA("HarvestingTool"))
                return;
            const lastUse = this.lastUsePerPlayer.get(player);
            const t =  tick();
            if (lastUse !== undefined && t + 0.5 + 8 / (item.speed ?? 1) < lastUse)
                return;
            this.lastUsePerPlayer.set(player, t);
            const harvestableData = Harvestable[harvestable.Name as HarvestableId];
            let damage = item.toolType === harvestableData.tool ? item.damage! : (item.damage! * 0.05);
            if (math.random(1, 100) / 100 <= this.getCritChance(item)) {
                damage *= 2;
            }
            damage *= math.random(80, 120) * 0.01;
            const health = (harvestable.GetAttribute("Health") as number) - damage;
            harvestable.SetAttribute("Health", health);
            if (health <= 0) {
                const receiving = new Map<string, number>();
                if (harvestableData.gives !== undefined) {
                    for (const [id, minMax] of harvestableData.gives)
                        receiving.set(id, math.random(minMax[0], minMax[1]));
                }
                else {
                    receiving.set(harvestable.Name, math.random(1, 2));
                }
                for (const [id, amount] of receiving)
                    this.itemsService.setItemAmount(id, this.itemsService.getItemAmount(id) + amount);
                Packets.itemsReceived.fireAll(receiving);

                this.moveHarvestable(harvestable, this.originalPosPerHarvestable.get(harvestable)!.sub(new Vector3(0, -500, 0)));
                harvestable.SetAttribute("Health", harvestableData.health);
                task.delay(math.random(20, 30), () => {
                    this.moveHarvestable(harvestable, this.originalPosPerHarvestable.get(harvestable)!);
                });
            }
        });

        for (const [_id, area] of pairs(AREAS)) {
            const harvestables = area.areaFolder.FindFirstChild("Harvestable")?.GetChildren();
            if (harvestables === undefined)
                continue;
            for (const model of harvestables) {
                const harvestable = Harvestable[model.Name as HarvestableId];
                if (harvestable === undefined) {
                    warn(model.Name + " does not have a harvestable");
                    continue;
                }
                model.SetAttribute("Health", harvestable.health);
                if (model.IsA("Model")) {
                    this.originalPosPerHarvestable.set(model, model.GetPivot().Position);
                    for (const part of model.GetDescendants())
                        if (part.IsA("BasePart"))
                            part.CollisionGroup = "ItemHitbox";
                }
                else if (model.IsA("BasePart")) {
                    model.CollisionGroup = "ItemHitbox";
                    this.originalPosPerHarvestable.set(model, model.Position);
                }
            }
        }
    }
}