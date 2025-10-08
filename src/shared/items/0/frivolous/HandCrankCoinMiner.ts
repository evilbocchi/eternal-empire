import Difficulty from "@rbxts/ejt";
import { getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import HandCrank from "shared/item/traits/action/HandCrank";
import Boostable from "shared/item/traits/boost/Boostable";
import Dropper from "shared/item/traits/dropper/Dropper";
import Class0Shop from "shared/items/0/Class0Shop";

const key = "HandCrank";

export = new Item(script.Name)
    .setName("Hand Crank Coin Miner")
    .setDescription("Click the hand crank to triple drop rate. Produces %val% droplets per second in its normal state.")
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1e6), 1)
    .setPrice(new CurrencyBundle().set("Bitcoin", 5e6), 2)
    .setPrice(new CurrencyBundle().set("Bitcoin", 25e6), 3)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)

    .onLoad((model) => {
        const drop = model.WaitForChild("Drop");
        const instanceInfo = getAllInstanceInfo(drop);
        Boostable.addBoost(instanceInfo, key, { ignoresLimitations: false });
    })

    .trait(Dropper)
    .setDroplet(Droplet.HandCrankedCoin)
    .setDropRate(1)
    .exit()

    .trait(HandCrank)
    .setCallback((t, model) => {
        const drop = model.WaitForChild("Drop");
        const modifier = getInstanceInfo(drop, "Boosts")?.get(key);
        if (modifier === undefined) return;

        modifier.dropRateMul = t < 5 ? 3 : 1;
    })

    .exit();
