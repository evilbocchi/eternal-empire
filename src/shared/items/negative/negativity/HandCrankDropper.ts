import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import HandCrank from "shared/item/traits/action/HandCrank";
import Dropper from "shared/item/traits/dropper/Dropper";

const modifier: ItemBoost = { placementId: "", ignoresLimitations: false, dropRateMultiplier: 3 };

export = new Item(script.Name)
    .setName("Hand Crank Dropper")
    .setDescription("Click the hand crank to triple drop rate. Produces %val% droplets per second in its normal state.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 2500), 1, 2)
    .setPrice(new CurrencyBundle().set("Funds", 5000), 3)
    .addPlaceableArea("BarrenIslands")

    .onLoad((model) => {
        modifier.placementId = model.Name;
        const drop = model.WaitForChild("Drop");
        const instanceInfo = getAllInstanceInfo(drop);
        instanceInfo.Boosts!.set("HandCrank", modifier);
    })

    .trait(Dropper)
    .setDroplet(Droplet.ManualDroplet)
    .setDropRate(1)
    .exit()

    .trait(HandCrank)
    .setCallback((t) => (modifier.dropRateMultiplier = t < 5 ? 3 : 1))

    .exit();
