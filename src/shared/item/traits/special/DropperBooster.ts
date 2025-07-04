import { getAllInstanceInfo } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import Item from "shared/item/Item";
import { ServerAPI, getPlacedItemsInArea } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        DropperBooster: DropperBooster;
    }
}


export default class DropperBooster extends ItemTrait {

    mul = 1;

    static load(model: Model, booster: DropperBooster) {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.CanTouch = true;
        clickArea.CollisionGroup = "ItemHitbox";
        clickArea.Touched.Connect(() => { });
        const Items = ServerAPI.items;
        let target: BasePart | undefined;
        let targetInfo: InstanceInfo | undefined;
        const modifier = { multi: booster.mul };

        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (target === undefined) {
                if (t > 0.05) {
                    t = 0;
                    const found = getPlacedItemsInArea(clickArea, Items);
                    for (const [model, item] of found) {
                        if (item.isA("Dropper")) {
                            const drop = model.FindFirstChild("Drop");
                            if (drop === undefined)
                                continue;
                            target = drop as BasePart;
                            targetInfo = getAllInstanceInfo(target);
                            return;
                        }
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