import Item from "shared/item/Item";
import NamedUpgrade from "../namedupgrade/NamedUpgrade";

declare global {
    interface ItemTypes {
        UpgradeBoard: UpgradeBoard;
    }
}

class UpgradeBoard extends Item {

    upgrades = new Array<NamedUpgrade>();

    constructor(id: string) {
        super(id);
        this.types.add("UpgradeBoard");
        this.onLoad(() => {

        });
    }

    addUpgrade(upgrade: NamedUpgrade) {
        this.upgrades.push(upgrade);
        return this;
    }
}

export = UpgradeBoard;