import Item from "shared/item/Item";

declare global {
    interface ItemTypes {
        Charm: Charm;
    }
}

class Charm extends Item {

    criticalAdd: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Charm");
    }

    setCriticalAdd(criticalAdd: number) {
        this.criticalAdd = criticalAdd;
        return this;
    }
}

export = Charm;