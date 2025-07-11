import Item from "shared/item/Item";

declare global {
    interface ItemTypes {
        Shop: Shop;
    }
}

class Shop extends Item {
    
    items: Item[] = [];

    constructor(id: string) {
        super(id);
        this.types.add("Shop");
        this.onLoad((model) => {
            const prompt = new Instance("ProximityPrompt");
            prompt.RequiresLineOfSight = false;
            prompt.ObjectText = this.name ?? "Shop";
            prompt.ActionText = "Open";
            prompt.HoldDuration = 0.2;
            prompt.Name = this.id;
            prompt.SetAttribute("Shop", model.Name);
            prompt.Parent = model.WaitForChild("NPC");
        })
        this.persists();
    }

    setItems(items: Item[]) {
        this.items = items;
        return this;
    }
}

export = Shop;