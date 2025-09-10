import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Studded Dropper")
    .setDescription("Not sure how it's still in good shape, but drops pretty healthy droplets " +
     "at %val% every 3 seconds.")
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Funds", 7.5e35).set("Skill", 1200).set("Power", 6000000000000), 1)
    .addPlaceableArea("BarrenIslands" , "SlamoVillage")
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.StuddedDroplet)
    .setDropRate(3)

    .exit();
