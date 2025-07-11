import Difficulty from "@antivivi/jjt-difficulties";
import { Lighting } from "@rbxts/services";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Dropper(script.Name)
    .setName("Solar Powered Dropper")
    .setDescription("Produces %val% droplets per second, but has increased drop rate in the day!")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new Price().setCost("Funds", 1e33).setCost("Skill", 45), 1)
    .setCreator("superGirlygamer8o")

    .addPlaceableArea("BarrenIslands")
    .persists()
    .setDroplet(Droplet.SolarDroplet)
    .setDropRate(1)
    .onLoad((model, item) => {
        const drop = model.WaitForChild("Drop");
        const instanceInfo = GameUtils.getAllInstanceInfo(drop);
        const modifier = {multi: 1}
        instanceInfo.DropRateModifiers!.add(modifier);
        item.repeat(model, () => {
            modifier.multi = (12 - math.abs(Lighting.ClockTime - 12)) / 6 + 1;
        }, 1);
    });