import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import ItemTrait from "shared/item/traits/ItemTrait";
import { getAllInstanceInfo } from "@antivivi/vrldk";

declare global {
    interface ItemTraits {
        UnleashedConveyor: UnleashedConveyor;
    }
}

export default class UnleashedConveyor extends ItemTrait {

    static load(model: Model, _conveyor: UnleashedConveyor) {
        const instanceInfo = getAllInstanceInfo(model);
        instanceInfo.BoostAdded?.add(() => instanceInfo.UpdateSpeed?.());
        instanceInfo.BoostRemoved?.add(() => instanceInfo.UpdateSpeed?.());
    }

    constructor(item: Item) {
        super(item);
        item.trait(Boostable).addToWhitelist("ConveyorOverclocker");

        item.onLoad((model) => UnleashedConveyor.load(model, this));
    }
}