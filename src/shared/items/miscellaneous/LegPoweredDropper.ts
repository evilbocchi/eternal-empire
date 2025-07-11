import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import WhiteGem from "shared/items/excavation/WhiteGem";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Dropper(script.Name)
    .setName("Leg Powered Dropper")
    .setDescription("Stop being lazy and start exercising. Run on the treadmill to activate the dropper, producing %val% droplets per second.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new Price().setCost("Funds", 5e12))
    .setRequiredItemAmount(WhiteGem, 18)
    .setCreator("taptap71")

    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setDroplet(Droplet.LegDayDroplet)
    .setSpeed(16)
    .setDropRate(1)
    .onLoad((model, item) => {
        const thitbox = model.WaitForChild("TreadmillHitbox") as BasePart;
        thitbox.Touched.Connect(() => { });

        const drop = model.WaitForChild("Drop");
        const instanceInfo = GameUtils.getAllInstanceInfo(drop);
        const modifier = {multi: 0}
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
