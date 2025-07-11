import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Special from "shared/item/Special";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Dropper(script.Name)
    .setName("Hand Crank Dropper V2")
    .setDescription("Increases drop rate to x3 when cranked, producing %val% droplets per second in its normal state. This item will reset on skillification, like other Barren Islands items!")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new Price().setCost("Funds", 121e21), 1)
    .setPrice(new Price().setCost("Funds", 242e21), 2)
    .addPlaceableArea("BarrenIslands")

    .setDroplet(Droplet.ManualV2Droplet)
    .setDropRate(1)
    .onLoad((model) => {
        const drop = model.WaitForChild("Drop");
        const instanceInfo = GameUtils.getAllInstanceInfo(drop);
        const modifier = {multi: 3}
        instanceInfo.DropRateModifiers!.add(modifier);
        Special.HandCrank.load(model, (t) => modifier.multi = t < 5 ? 3 : 1);
    });