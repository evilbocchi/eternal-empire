import eat from "shared/hamster/eat";
import { Server } from "shared/api/APIExpose";
import Gear from "shared/item/traits/Gear";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";
import HARVESTABLES from "shared/world/harvestable/Harvestable";

export default class HarvestableManager {
    static readonly originalPosPerHarvestable = new Map<Instance, Vector3>();

    /**
     * Moves a harvestable instance to a new position.
     * @param harvestable The harvestable instance.
     * @param pos The new position.
     */
    static moveHarvestable(harvestable: Instance, pos: Vector3) {
        if (harvestable.IsA("Model")) harvestable.PivotTo(new CFrame(pos));
        else if (harvestable.IsA("BasePart")) harvestable.Position = pos;
    }

    /**
     * Checks if a tool is within range of a harvestable.
     * @param tool The tool model.
     * @param harvestable The harvestable instance.
     */
    static isWithin(tool: Model, harvestable: Instance) {
        let position: Vector3;
        if (harvestable.IsA("Model") && harvestable.PrimaryPart !== undefined)
            position = harvestable.PrimaryPart!.Position;
        else if (harvestable.IsA("BasePart")) position = harvestable.Position;
        else error("Harvestable is not a BasePart or Model");
        const bladePos = ((tool.FindFirstChild("Blade") as BasePart | undefined) ?? tool.PrimaryPart)!.Position;
        const x = bladePos.X - position.X;
        const y = bladePos.Y - position.Y;
        const z = bladePos.Z - position.Z;
        if (x * x + z * z < 100 && y * y < 100) return true;
    }

    /**
     * Calculates the critical hit chance for a harvesting tool.
     * @param _item The harvesting tool.
     */
    static getCritChance(_item: Gear, itemService: typeof Server.Item) {
        let critChance = 5;
        const inventory = itemService.items.inventory;
        for (const charm of Items.charms) {
            const amount = inventory.get(charm.item.id);
            if (amount !== undefined && amount > 0) {
                if (charm.criticalAdd !== undefined) critChance += charm.criticalAdd;
            }
        }
        return critChance / 100;
    }

    static load(itemService: typeof Server.Item) {
        for (const [_id, area] of pairs(AREAS)) {
            const harvestables = area.worldNode.getInstance()?.FindFirstChild("Harvestable")?.GetChildren();
            if (harvestables === undefined) continue;
            for (const model of harvestables) {
                const harvestable = HARVESTABLES[model.Name as HarvestableId];
                if (harvestable === undefined) {
                    warn(model.Name + " does not have a harvestable");
                    continue;
                }
                model.SetAttribute("Health", harvestable.health);
                if (model.IsA("Model")) {
                    this.originalPosPerHarvestable.set(model, model.GetPivot().Position);
                    for (const part of model.GetDescendants())
                        if (part.IsA("BasePart")) part.CollisionGroup = "ItemHitbox";
                } else if (model.IsA("BasePart")) {
                    model.CollisionGroup = "ItemHitbox";
                    this.originalPosPerHarvestable.set(model, model.Position);
                }
            }
        }
        const lastUsePerPlayer = new Map<Player, number>();
        const connection = Packets.useTool.fromClient((player, harvestable) => {
            if (harvestable === undefined) return;
            const character = player.Character;
            if (character === undefined) return;
            const rootPart = character.FindFirstChildOfClass("Humanoid")?.RootPart;
            if (rootPart === undefined) return;
            const tool = character.FindFirstChildOfClass("Tool");
            if (tool === undefined || this.isWithin(tool, harvestable) !== true) return;
            const item = Items.getItem(tool.Name);
            if (item === undefined) return;
            const gear = item.findTrait("Gear");
            if (gear === undefined) return;

            const lastUse = lastUsePerPlayer.get(player);
            const t = tick();
            if (lastUse !== undefined && t + 0.5 + 8 / (gear.speed ?? 1) < lastUse) return;
            lastUsePerPlayer.set(player, t);
            const harvestableData = HARVESTABLES[harvestable.Name as HarvestableId];
            let damage = gear.type === harvestableData.tool ? gear.damage! : gear.damage! * 0.05;
            if (math.random(1, 100) / 100 <= this.getCritChance(gear, itemService)) {
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
                } else {
                    receiving.set(harvestable.Name, math.random(1, 2));
                }
                for (const [id, amount] of receiving) {
                    itemService.giveItem(id, amount);
                }
                Packets.showItemReward.toAllClients(receiving);

                this.moveHarvestable(
                    harvestable,
                    this.originalPosPerHarvestable.get(harvestable)!.sub(new Vector3(0, -500, 0)),
                );
                harvestable.SetAttribute("Health", harvestableData.health);
                task.delay(math.random(20, 30), () => {
                    this.moveHarvestable(harvestable, this.originalPosPerHarvestable.get(harvestable)!);
                });
            }
        });
        eat(connection);
    }
}
