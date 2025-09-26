import { Server } from "shared/api/APIExpose";
import Item from "shared/item/Item";
import Operative from "shared/item/traits/Operative";
import getPlacedItemsInBounds from "shared/item/utils/getPlacedItemsInBounds";

export default abstract class Booster extends Operative {
    observeTarget(model: Model, callback: (model: Model | undefined, item: Item | undefined) => boolean) {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        const Items = Server.Items;
        const whitelist = this.whitelist;

        let t = 0;
        let target: Model | undefined;
        let targetItem: Item | undefined;
        this.item.repeat(model, (dt) => {
            t += dt;
            if (target === undefined) {
                if (t > 0.1) {
                    t = 0;
                    const found = getPlacedItemsInBounds(clickArea, Items);
                    for (const [model, item] of found) {
                        if (whitelist !== undefined && !whitelist(model, item)) {
                            continue;
                        }

                        if (!callback(model, item)) {
                            continue;
                        }
                        target = model;
                        targetItem = item;
                        break;
                    }
                }
            } else if (target.Parent === undefined) {
                target = undefined;
                callback(undefined, undefined);
            } else {
                callback(target, targetItem);
            }
        });

        model.Destroying.Once(() => {
            callback(undefined, undefined);
        });
    }

    abstract createToken(model: Model, whitelist?: (model: Model, item: Item) => boolean): ItemBoost;

    whitelist?: (model: Model, item: Item) => boolean;

    setWhitelist(whitelist: (model: Model, item: Item) => boolean) {
        this.whitelist = whitelist;
        return this;
    }
}
