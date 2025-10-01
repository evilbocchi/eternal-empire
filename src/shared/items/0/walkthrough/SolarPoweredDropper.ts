import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Lighting } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Dropper from "shared/item/traits/dropper/Dropper";

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
        const modifier: ItemBoost = {
            ignoresLimitations: false,
            dropRateMul: 1, // Default multiplier
        };
        Boostable.addBoost(instanceInfo, "Solar", modifier);
        item.repeat(
            model,
            () => {
                modifier.dropRateMul = (12 - math.abs(Lighting.ClockTime - 12)) / 6 + 1;
            },
            1,
        );
    });
