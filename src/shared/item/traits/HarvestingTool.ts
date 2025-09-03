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
}
