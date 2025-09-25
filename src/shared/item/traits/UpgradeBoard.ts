import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import NamedUpgrade from "../../namedupgrade/NamedUpgrade";

declare global {
    interface ItemTraits {
        UpgradeBoard: UpgradeBoard;
    }
}

export default class UpgradeBoard extends ItemTrait {
    static clientLoad(model: Model) {
        model.AddTag("UpgradeBoard");
    }

    upgrades = new Array<NamedUpgrade>();

    constructor(item: Item) {
        super(item);
        item.onClientLoad((model) => UpgradeBoard.clientLoad(model));
    }

    addUpgrade(upgrade: NamedUpgrade) {
        this.upgrades.push(upgrade);
        return this;
    }
}
