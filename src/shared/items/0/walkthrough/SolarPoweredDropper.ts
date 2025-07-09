import Difficulty from "@antivivi/jjt-difficulties";
import { Lighting } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import { getAllInstanceInfo } from "@antivivi/vrldk";

export = new Item(script.Name)
    .setName("Solar Powered Dropper")
    .setDescription("Produces %val% droplets every 2 seconds, but has increased drop rate in the day!")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Funds", 1e33).set("Skill", 45), 1)
    .setCreator("superGirlygamer8o")
    .addPlaceableArea("BarrenIslands")
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.SolarDroplet)
    .setDropRate(0.5)
    .exit()

    .onLoad((model, item) => {
        const drop = model.WaitForChild("Drop");
        const instanceInfo = getAllInstanceInfo(drop);
        const modifier = { multi: 1 };
        instanceInfo.DropRateModifiers!.add(modifier);
        item.repeat(model, () => {
            modifier.multi = (12 - math.abs(Lighting.ClockTime - 12)) / 6 + 1;
        }, 1);
    });