import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("'Happy' Dropper")
    .setDescription(
        "Happy, fun times! Yay! Produces %val% droplets every 4 seconds!! Yes, Skill! What a great boost! You'll agree, right? RIGHT?",
    )
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 600e30).set("Power", 1e18).set("Skill", 20), 1)
    .setPrice(new CurrencyBundle().set("Funds", 1.2e33).set("Power", 2e18).set("Skill", 40), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.HappyDroplet)
    .setDropRate(0.25)

    .exit();
