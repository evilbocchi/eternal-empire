import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Dropper from "shared/item/traits/dropper/Dropper";
import StaleWood from "shared/items/excavation/harvestable/StaleWood";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Leg Powered Dropper")
    .setDescription("Stop being lazy and start exercising. Run on the treadmill to activate the dropper, producing %val% droplets per second.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 5e12))
    .setRequiredItemAmount(WhiteGem, 18)
    .setRequiredItemAmount(StaleWood, 10)
    .setCreator("taptap71")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.LegDayDroplet)
    .setDropRate(1)

    .trait(Conveyor)
    .setSpeed(16)
    .exit()

    .onLoad((model, item) => {
        const thitbox = model.WaitForChild("TreadmillHitbox") as BasePart;
        thitbox.CanTouch = true;
        thitbox.Touched.Connect(() => { });

        const drop = model.WaitForChild("Drop");
        const instanceInfo = getAllInstanceInfo(drop);
        const modifier = { multi: 0 };
        instanceInfo.DropRateModifiers!.add(modifier);

        item.repeat(model, () => {
            const touchingParts = thitbox.GetTouchingParts();
            let hasCharacter = false;
            for (const part of touchingParts) {
                const humanoid = part.Parent?.FindFirstChildOfClass("Humanoid");
                if (humanoid !== undefined) {
                    hasCharacter = true;
                    break;
                }
            }
            modifier.multi = hasCharacter === true ? 1 : 0;
        }, 0.5);
    });
