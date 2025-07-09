import { getAllInstanceInfo } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import Item from "shared/item/Item";
import { Server, getPlacedItemsInArea } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        DropperBooster: DropperBooster;
    }
}


export default class DropperBooster extends ItemTrait {

    mul = 1;

    /**
     * Creates a modifier for the drop rate of droppers in the area of the model.
     * 
     * @param model The model to create the modifier for.
     * @param whitelist Optional function to filter items that should be affected by the modifier.
     * @returns A modifier object that can be used to adjust the drop rate.
     */
    static createModifier(model: Model, whitelist?: (model: Model, item: Item) => boolean) {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.CanTouch = true;
        clickArea.CollisionGroup = "ItemHitbox";
        clickArea.Touched.Connect(() => { });
        const Items = Server.items;
        let target: BasePart | undefined;
        let targetInfo: InstanceInfo | undefined;
        const modifier = { multi: 1 };

        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (target === undefined) {
                if (t > 0.05) {
                    t = 0;

                    const found = getPlacedItemsInArea(clickArea, Items);
                    for (const [model, item] of found) {
                        if (!item.isA("Dropper")) {
                            continue;
                        }
                        if (whitelist !== undefined && !whitelist(model, item)) {
                            continue;
                        }

                        const drop = model.FindFirstChild("Drop");
                        if (drop === undefined)
                            continue;

                        target = drop as BasePart;
                        targetInfo = getAllInstanceInfo(target);
                        return;
                    }
                }
            }
            else if (target.Parent === undefined) {
                targetInfo?.DropRateModifiers?.delete(modifier);
            }
            else {
                targetInfo?.DropRateModifiers?.add(modifier);
            }
        });
        model.Destroying.Once(() => {
            targetInfo?.DropRateModifiers?.delete(modifier);
            connection.Disconnect();
        });
        return modifier;
    }

    /**
     * Loads the drop rate multiplier for the booster from the model.
     * 
     * @param model The model to load the booster from.
     * @param booster The booster instance to apply the multiplier to.
     */
    static load(model: Model, booster: DropperBooster) {
        const modifier = DropperBooster.createModifier(model);
        modifier.multi = booster.mul;
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => DropperBooster.load(model, this));
    }

    setDropRateMultiplier(mul: number) {
        this.mul = mul;
        return this;
    }
}