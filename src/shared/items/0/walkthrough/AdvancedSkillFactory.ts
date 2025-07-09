import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Advanced Skill Factory")
    .setDescription("Alright, it's time to actually pick up the pace. Produce %val% droplets every 2 seconds.")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Funds", 15e33).set("Skill", 70), 1)
    .setPrice(new CurrencyBundle().set("Funds", 70e33).set("Skill", 200), 2)
    .addPlaceableArea("SlamoVillage")

    .trait(Dropper)
    .setDroplet(Droplet.SkillerDroplet)
    .setDropRate(0.5)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();