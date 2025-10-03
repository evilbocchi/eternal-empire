import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Server } from "shared/api/APIExpose";
import Item from "shared/item/Item";
import Operative from "shared/item/traits/Operative";
import getPlacedItemsInBounds from "shared/item/utils/getPlacedItemsInBounds";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";

export default abstract class Booster extends Operative {
    observeTarget(model: Model, callback: (model: Model | undefined, item: Item | undefined) => boolean) {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        const Items = Server.Items;
        const whitelist = this.whitelist;
        const boosterInfo = getAllInstanceInfo(model);

        let t = 0;
        let target: Model | undefined;
        let targetItem: Item | undefined;
        let isDisabled = isPlacedItemUnusable(boosterInfo);

        const releaseTarget = () => {
            if (target === undefined) {
                return;
            }

            callback(undefined, undefined);
            target = undefined;
            targetItem = undefined;
        };

        if (isDisabled) {
            releaseTarget();
        }

        const boostTarget = (dt: number) => {
            t += dt;

            const unusable = isPlacedItemUnusable(boosterInfo);
            if (unusable) {
                if (!isDisabled) {
                    releaseTarget();
                }
                isDisabled = true;
                t = 0;
                return;
            }

            if (isDisabled) {
                isDisabled = false;
                t = 0;
            }

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
                releaseTarget();
            } else {
                callback(target, targetItem);
            }
        };

        this.item.repeat(model, boostTarget, 0.1);

        model.Destroying.Once(releaseTarget);
    }

    abstract createToken(boosterModel: Model, whitelist?: (targetModel: Model, item: Item) => boolean): ItemBoost;

    whitelist?: (model: Model, item: Item) => boolean;

    setWhitelist(whitelist: (model: Model, item: Item) => boolean) {
        this.whitelist = whitelist;
        return this;
    }
}
