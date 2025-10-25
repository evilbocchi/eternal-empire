import { getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import HandCrank from "shared/item/traits/action/HandCrank";
import Boostable from "shared/item/traits/boost/Boostable";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Hand Crank Dropper")
    .setDescription("Click the hand crank to triple drop rate. Produces %val% droplets per second in its normal state.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 2500), 1, 2)
    .setPrice(new CurrencyBundle().set("Funds", 5000), 3)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .onLoad((model) => {
        const drop = model.WaitForChild("Drop");
        const instanceInfo = getAllInstanceInfo(drop);
        Boostable.addBoost(instanceInfo, "HandCrank", { ignoresLimitations: false });
    })

    .trait(Dropper)
    .setDroplet(Droplet.ManualDroplet)
    .setDropRate(1)
    .exit()

    .trait(HandCrank)
    .setCallback((t, model) => {
        const drop = model.WaitForChild("Drop");
        const dropInfo = getAllInstanceInfo(drop);

        const modifier = dropInfo.boosts?.get("HandCrank");
        if (modifier === undefined) return;

        modifier.dropRateMul = t < 5 ? 3 : 1;
    })

    .exit();
