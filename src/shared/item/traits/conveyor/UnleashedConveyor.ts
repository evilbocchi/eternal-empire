import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        UnleashedConveyor: UnleashedConveyor;
    }
}

export default class UnleashedConveyor extends ItemTrait {
    static load(model: Model, _conveyor: UnleashedConveyor) {
        const instanceInfo = getAllInstanceInfo(model);
        instanceInfo.Chargeable = true;
        instanceInfo.BoostAdded?.add(() => instanceInfo.UpdateSpeed?.());
        instanceInfo.BoostRemoved?.add(() => instanceInfo.UpdateSpeed?.());
    }

    constructor(item: Item) {
        super(item);
        item.trait(Generator).addToWhitelist("ConveyorOverclocker");

        item.onLoad((model) => UnleashedConveyor.load(model, this));
    }
}
