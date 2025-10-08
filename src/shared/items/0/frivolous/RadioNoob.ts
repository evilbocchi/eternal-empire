import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Charger from "shared/item/traits/generator/Charger";
import MiniDropletSlayer from "shared/items/negative/relax/MiniDropletSlayer";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Radio Noob")
    .setDescription(
        "This noob chose to take command over other noobs, expertly practicing the fine craft that is proper spelling and grammar. Buffs nearby Noob Clickers by x200K, Noob Droplet Slayers are x2 faster and can hit twice.",
    )
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Funds", 5e39), 1)
    .setRequiredItemAmount(MiniDropletSlayer, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("simple13579")

    .trait(Charger)
    .setRadius(12)
    .addToWhitelist("NoobClicker")
    .addToWhitelist("DropletSlayerMkII")
    .addToWhitelist("MiniDropletSlayer")
    .setBoost({
        clickValueMul: 200000,
        cooldownMul: 0.5,
    })

    .exit();
