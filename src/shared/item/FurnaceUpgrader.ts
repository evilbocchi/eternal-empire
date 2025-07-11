import Furnace from "shared/item/Furnace";
import Operative from "shared/item/Operative";
import Upgrader from "shared/item/Upgrader";
import ItemUtils, { GameUtils } from "shared/utils/ItemUtils";

class FurnaceUpgrader extends Operative {

    furnace: Furnace;
    upgrader: Upgrader;

    constructor(id: string) {
        super(id);
        this.types.add("Furnace");
        this.types.add("Upgrader");

        this.furnace = new Furnace(id + "__F");
        this.upgrader = new Upgrader(id + "__U");
        this.onInit(() => {
            const Items = GameUtils.items;
            Items.setItem(this.furnace.id, this.furnace);
            Items.setItem(this.upgrader.id, this.upgrader);
            this.furnace.INITALIZES.forEach((callback) => callback(this.furnace));
            this.upgrader.INITALIZES.forEach((callback) => callback(this.upgrader));
        });
        this.onLoad((model) => {
            this.furnace.LOADS.forEach((callback) => callback(model, this.furnace));
            this.upgrader.LOADS.forEach((callback) => callback(model, this.upgrader));
        });
    }
}

export = FurnaceUpgrader;