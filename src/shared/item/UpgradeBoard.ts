import Item from "shared/item/Item";
import NamedUpgrade from "./NamedUpgrade";

class UpgradeBoard extends Item {
    
    upgrades = new Array<NamedUpgrade>();

    constructor(id: string) {
        super(id);
        this.types.push("UpgradeBoard");
        this.onLoad(() => {
            
        });
    }

    addUpgrade(upgrade: NamedUpgrade) {
        this.upgrades.push(upgrade);
        return this;
    }
}

export = UpgradeBoard;