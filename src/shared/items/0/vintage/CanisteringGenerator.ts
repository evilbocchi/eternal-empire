import Difficulty from "@antivivi/jjt-difficulties";
import { RunService } from "@rbxts/services";
import Generator from "shared/item/Generator";
import Price from "shared/Price";
import { GameUtils, getPlacedItemsInArea } from "shared/utils/ItemUtils";

export = new Generator(script.Name)
    .setName("Canistering Generator")
    .setDescription("Boosts the drop rate of any dropper adjacent to the canister's vent by 2.5 times! Also produces %gain%.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new Price().setCost("Power", 200e15).setCost("Bitcoin", 76000), 1)
    .addPlaceableArea("BarrenIslands")

    .setPassiveGain(new Price().setCost("Power", 400e6))
    .ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
    .onLoad((model) => {
        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.Touched.Connect(() => { });
        const Items = GameUtils.items;
        let target: BasePart | undefined;
        let targetInfo: InstanceInfo | undefined;
        const modifier = {multi: 2.5};

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
                            targetInfo = GameUtils.getAllInstanceInfo(target);
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