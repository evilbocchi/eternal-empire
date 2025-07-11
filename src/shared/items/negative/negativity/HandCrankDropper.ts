import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Special from "shared/item/Special";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Dropper(script.Name)
    .setName("Hand Crank Dropper")
    .setDescription("Click the hand crank to triple drop rate. Produces %val% droplets per second in its normal state.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new Price().setCost("Funds", 5500), 1, 2)
    .setPrice(new Price().setCost("Funds", 7000), 3)
    .addPlaceableArea("BarrenIslands")

    .setDroplet(Droplet.ManualDroplet)
    .setDropRate(1)
    .onLoad((model) => {
        const drop = model.WaitForChild("Drop");
        const instanceInfo = GameUtils.getAllInstanceInfo(drop);
        const modifier = {multi: 3}
        instanceInfo.DropRateModifiers!.add(modifier);
        Special.HandCrank.load(model, (t) => modifier.multi = t < 5 ? 3 : 1);
    });