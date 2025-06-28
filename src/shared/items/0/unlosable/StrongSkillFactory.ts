import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Dropper from "shared/item/traits/Dropper";

export = new Item(script.Name)
    .setName("Strong Skill Factory")
    .setDescription("Produce %val% droplets every 2 seconds.")
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Skill", 270000), 1)
    .setPrice(new CurrencyBundle().set("Skill", 470000), 2)
    .addPlaceableArea("SlamoVillage")

    .trait(Dropper)
    .setDroplet(Droplet.SkillestDroplet)
    .setDropRate(0.5)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();