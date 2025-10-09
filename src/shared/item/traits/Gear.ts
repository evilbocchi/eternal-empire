import type CurrencyService from "server/services/data/CurrencyService";
import type ItemService from "server/services/item/ItemService";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Gear: Gear;
    }
    type GearType = (typeof GEAR_TYPES)[number];
}

const GEAR_TYPES = ["Sword", "Pickaxe", "Axe", "Scythe", "Rod", "None"] as const;

export interface GearUseContext {
    player: Player;
    tool: Tool;
    gear: Gear;
    item: Item;
    target?: Instance;
}

export type GearOnUseHandler = (context: GearUseContext) => boolean | void;

export default class Gear extends ItemTrait {
    type: GearType = "None";
    speed?: number;
    damage?: number;
    onUse?: GearOnUseHandler;

    constructor(item: Item) {
        super(item);
    }

    setType(gearType: GearType) {
        this.type = gearType;
        return this;
    }

    setSpeed(speed: number) {
        this.speed = speed;
        return this;
    }

    setDamage(damage: number) {
        this.damage = damage;
        return this;
    }

    setOnUse(handler: GearOnUseHandler) {
        this.onUse = handler;
        return this;
    }

    /**
     * Gets the best tool for each gear type from the provided array of gears.
     * @param gears Array of Gear instances to evaluate.
     * @returns A tuple containing:
     *  - A set of the best Gears for each GearType.
     *  - A set of the worse Gears that were not selected as the best.
     */
    static getBestGears(gears: Gear[]): LuaTuple<[Set<Gear>, Set<Gear>]> {
        const bestPerType = new Map<GearType, Gear>();
        const worse = new Set<Gear>();
        const all = new Set<Gear>();
        for (const gear of gears) {
            if (gear.type === "None") {
                all.add(gear);
                continue;
            }

            const current = bestPerType.get(gear.type);
            if (current === undefined || current.item.difficulty.layoutRating! < gear.item.difficulty.layoutRating!) {
                bestPerType.set(gear.type, gear);
                if (current !== undefined) worse.add(current);
            }
        }
        for (const [, gear] of bestPerType) {
            all.add(gear);
        }

        return $tuple(all, worse);
    }

    /**
     * Gets the best tools from a given inventory map of item IDs to their quantities.
     * @param inventory Map of item IDs to their quantities.
     * @param itemsPerId Map of item IDs to their corresponding Item instances.
     * @returns A tuple containing:
     *  - A set of the best Gears for each GearType found in the inventory.
     *  - A set of the worse Gears that were not selected as the best.
     */
    static getBestGearsFromInventory(inventory: Map<string, number>, itemsPerId: Map<string, Item>) {
        const tools = new Array<Gear>();
        for (const [id, amount] of inventory) {
            const item = itemsPerId.get(id);
            if (item === undefined || amount < 1) continue;
            const gear = item.findTrait("Gear");
            if (gear === undefined) continue;
            tools.push(gear);
        }
        return Gear.getBestGears(tools);
    }
}
