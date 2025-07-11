import Item from "shared/item/Item";

declare global {
    interface ItemTypes {
        HarvestingTool: HarvestingTool;
    }
    type ToolType = typeof TOOL_TYPES[number];
}

const TOOL_TYPES = ["Sword", "Pickaxe", "Axe", "Scythe", "Rod", "None"] as const;

class HarvestingTool extends Item {
    toolType: ToolType = "None";
    speed?: number;
    damage?: number;
    image?: number;

    constructor(id: string) {
        super(id);
        this.types.add("HarvestingTool");
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

    setImage(image: number) {
        this.image = image;
        return this;
    }
}

export = HarvestingTool;