import Difficulty from "@antivivi/jjt-difficulties";
import { RunService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/Generator";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { GameUtils, getPlacedItemsInArea } from "shared/item/ItemUtils";

export = new Item(script.Name)
    .setName("Canistering Generator")
    .setDescription("Boosts the drop rate of any dropper adjacent to the canister's vent by 2.5 times! Also produces %gain%.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Power", 200e15).set("Bitcoin", 76000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 400e6))
    .exit()

    .onLoad((model) => {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.CanTouch = true;
        clickArea.CollisionGroup = "ItemHitbox";
        clickArea.Touched.Connect(() => { });
        const Items = GameUtils.items;
        let target: BasePart | undefined;
        let targetInfo: InstanceInfo | undefined;
        const modifier = { multi: 2.5 };

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
    });