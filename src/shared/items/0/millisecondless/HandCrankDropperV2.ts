import Difficulty from "@rbxts/ejt";
import { getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import HandCrank from "shared/item/traits/action/HandCrank";
import Boostable from "shared/item/traits/boost/Boostable";
import Dropper from "shared/item/traits/dropper/Dropper";

export = new Item(script.Name)
    .setName("Hand Crank Dropper V2")
    .setDescription(
        "Increases drop rate to x3 when cranked, producing %val% droplets per second in its normal state. This item will reset on skillification, like other Barren Islands items!",
    )
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Funds", 121e21), 1)
    .setPrice(new CurrencyBundle().set("Funds", 242e21), 2)
    .addPlaceableArea("BarrenIslands")

    .onLoad((model) => {
        const drop = model.WaitForChild("Drop");
        Boostable.addBoost(getAllInstanceInfo(drop), "HandCrank", { ignoresLimitations: false });
    })

    .trait(Dropper)
    .setDroplet(Droplet.ManualV2Droplet)
    .setDropRate(1)

    .trait(HandCrank)
    .setCallback((t, model) => {
        const drop = model.WaitForChild("Drop");
        const modifier = getInstanceInfo(drop, "Boosts")?.get("HandCrank");
        if (modifier === undefined) return;

        modifier.dropRateMul = t < 5 ? 3 : 1;
    })

    .exit();
