//!native
//!optimize 2

/**
 * @fileoverview ToolService - Manages player tools, harvesting logic, and harvestable objects.
 *
 * This service provides:
 * - Assigning best tools to players and removing worse tools
 * - Handling tool usage and harvestable interactions
 * - Managing harvestable health, rewards, and respawn
 * - Initializing harvestable objects in all areas
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import ItemService from "server/services/item/ItemService";
import { OnPlayerJoined } from "server/services/ModdingService";
import DataService from "server/services/serverdata/DataService";
import { AREAS } from "shared/Area";
import Harvestable from "shared/Harvestable";
import HarvestingTool from "shared/item/traits/HarvestingTool";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Service that manages player tools and harvestable object interactions.
 */
@Service()
export class ToolService implements OnInit, OnPlayerJoined, OnPlayerJoined {

    /** Last tool use timestamp per player for cooldowns. */
    lastUsePerPlayer = new Map<Player, number>();

    /** Original position of each harvestable for respawn logic. */
    originalPosPerHarvestable = new Map<Instance, Vector3>();

    constructor(private itemService: ItemService, private dataService: DataService) {
        // ...existing code...
    }

    /**
     * Moves a harvestable instance to a new position.
     * @param harvestable The harvestable instance.
     * @param pos The new position.
     */
    moveHarvestable(harvestable: Instance, pos: Vector3) {
        if (harvestable.IsA("Model"))
            harvestable.PivotTo(new CFrame(pos));
        else if (harvestable.IsA("BasePart"))
            harvestable.Position = pos;
    }

    /**
     * Returns the best tools per tool type and a list of worse tools.
     */
    getBestTools() {
        const items = this.dataService.empireData.items.inventory;
        const tools = new Map<ToolType, HarvestingTool>();
        const worse = new Array<HarvestingTool>();
        for (const [id, amount] of items) {
            const item = Items.getItem(id);
            if (item === undefined || amount < 1)
                continue;
            const harvestingTool = item.findTrait("HarvestingTool");
            if (harvestingTool === undefined || harvestingTool.toolType === "None")
                continue;

            const current = tools.get(harvestingTool.toolType);
            if (current === undefined || current.item.difficulty.rating! < item.difficulty.rating!) {
                tools.set(harvestingTool.toolType, harvestingTool);
                if (current !== undefined)
                    worse.push(current);
            }
        }
        return $tuple(tools, worse);
    }

    /**
     * Refreshes the player's tools, giving best tools and removing worse ones.
     * @param player The player whose tools are refreshed.
     */
    refreshTools(player: Player) {
        const [tools, worse] = this.getBestTools();
        const backpack = player.FindFirstChildOfClass("Backpack");
        if (backpack === undefined)
            return;
        for (const [_, tool] of tools) {
            const item = tool.item;
            const itemId = item.id;
            if (player.Character?.FindFirstChild(itemId) !== undefined || backpack.FindFirstChild(itemId) !== undefined)
                continue;
            const toolModel = item.MODEL?.Clone();
            if (toolModel !== undefined) {
                (toolModel as Tool).TextureId = item.image ?? "";
                toolModel.Parent = backpack;
            }
        }
        for (const tool of worse) {
            const itemId = tool.item.id;
            const holding = player.Character?.FindFirstChild(itemId);
            if (holding !== undefined)
                holding.Destroy();
            const inInv = backpack.FindFirstChild(itemId);
            if (inInv !== undefined)
                inInv.Destroy();
        }
    }

    /**
     * Checks if a tool is within range of a harvestable.
     * @param tool The tool model.
     * @param harvestable The harvestable instance.
     */
    isWithin(tool: Model, harvestable: Instance) {
        let position: Vector3;
        if (harvestable.IsA("Model") && harvestable.PrimaryPart !== undefined)
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

    /**
     * Calculates the critical hit chance for a harvesting tool.
     * @param _item The harvesting tool.
     */
    getCritChance(_item: HarvestingTool) {
        let critChance = 5;
        const inventory = this.dataService.empireData.items.inventory;
        for (const charm of Items.charms) {
            const amount = inventory.get(charm.item.id);
            if (amount !== undefined && amount > 0) {
                if (charm.criticalAdd !== undefined)
                    critChance += charm.criticalAdd;
            }
        }
        return critChance / 100;
    }

    /**
     * Handles player join events, refreshing tools and clearing backpack on death.
     * @param player The player who joined.
     */
    onPlayerJoined(player: Player) {
        player.CharacterAdded.Connect((character) => {
            (character.WaitForChild("Humanoid") as Humanoid).Died.Once(() => {
                player.FindFirstChildOfClass("Backpack")?.ClearAllChildren();
            });
            this.refreshTools(player);
        });
    }

    /**
     * Initializes the ToolService, sets up listeners and harvestable objects.
     */
    onInit() {
        this.itemService.itemsBought.connect((_player, items) => {
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
            if (item === undefined)
                return;
            const harvestingTool = item.findTrait("HarvestingTool");
            if (harvestingTool === undefined)
                return;

            const lastUse = this.lastUsePerPlayer.get(player);
            const t = tick();
            if (lastUse !== undefined && t + 0.5 + 8 / (harvestingTool.speed ?? 1) < lastUse)
                return;
            this.lastUsePerPlayer.set(player, t);
            const harvestableData = Harvestable[harvestable.Name as HarvestableId];
            let damage = harvestingTool.toolType === harvestableData.tool ? harvestingTool.damage! : (harvestingTool.damage! * 0.05);
            if (math.random(1, 100) / 100 <= this.getCritChance(harvestingTool)) {
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
                for (const [id, amount] of receiving) {
                    this.itemService.giveItem(id, amount);
                }
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