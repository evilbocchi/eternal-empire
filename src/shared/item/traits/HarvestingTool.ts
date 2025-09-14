import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        HarvestingTool: HarvestingTool;
    }
    type ToolType = (typeof TOOL_TYPES)[number];
}

const TOOL_TYPES = ["Sword", "Pickaxe", "Axe", "Scythe", "Rod", "None"] as const;

export default class HarvestingTool extends ItemTrait {
    toolType: ToolType = "None";
    speed?: number;
    damage?: number;

    constructor(item: Item) {
        super(item);
    }

    setToolType(toolType: ToolType) {
        this.toolType = toolType;
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

    /**
     * Gets the best tool for each tool type from the provided array of harvesting tools.
     * @param harvestingTools Array of HarvestingTool instances to evaluate.
     * @returns A tuple containing:
     *  - A set of the best HarvestingTools for each ToolType.
     *  - A set of the worse HarvestingTools that were not selected as the best.
     */
    static getBestTools(harvestingTools: HarvestingTool[]): LuaTuple<[Set<HarvestingTool>, Set<HarvestingTool>]> {
        const bestPerType = new Map<ToolType, HarvestingTool>();
        const worse = new Set<HarvestingTool>();
        const all = new Set<HarvestingTool>();
        for (const harvestingTool of harvestingTools) {
            if (harvestingTool.toolType === "None") {
                all.add(harvestingTool);
                continue;
            }

            const current = bestPerType.get(harvestingTool.toolType);
            if (current === undefined || current.item.difficulty.rating! < harvestingTool.item.difficulty.rating!) {
                bestPerType.set(harvestingTool.toolType, harvestingTool);
                if (current !== undefined) worse.add(current);
            }
        }
        for (const [, harvestingTool] of bestPerType) {
            all.add(harvestingTool);
        }

        return $tuple(all, worse);
    }

    /**
     * Gets the best tools from a given inventory map of item IDs to their quantities.
     * @param inventory Map of item IDs to their quantities.
     * @param itemsPerId Map of item IDs to their corresponding Item instances.
     * @returns A tuple containing:
     *  - A set of the best HarvestingTools for each ToolType found in the inventory.
     *  - A set of the worse HarvestingTools that were not selected as the best.
     */
    static getBestToolsFromInventory(inventory: Map<string, number>, itemsPerId: Map<string, Item>) {
        const tools = new Array<HarvestingTool>();
        for (const [id, amount] of inventory) {
            const item = itemsPerId.get(id);
            if (item === undefined || amount < 1) continue;
            const harvestingTool = item.findTrait("HarvestingTool");
            if (harvestingTool === undefined || harvestingTool.toolType === "None") continue;
            tools.push(harvestingTool);
        }
        return HarvestingTool.getBestTools(tools);
    }
}
