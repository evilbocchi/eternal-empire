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
        instanceInfo.chargeable = true;
        instanceInfo.boostAdded?.add(() => instanceInfo.updateSpeed?.());
        instanceInfo.boostRemoved?.add(() => instanceInfo.updateSpeed?.());
    }

    constructor(item: Item) {
        super(item);
        item.trait(Generator).addToWhitelist("ConveyorOverclocker");

        item.onLoad((model) => UnleashedConveyor.load(model, this));
    }
}
