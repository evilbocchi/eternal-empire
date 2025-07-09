import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Basic Skill Factory")
    .setDescription("Start producing Skill passively, with a Factory producing %val% droplets every 2 seconds.")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Power", 1e15).set("Skill", 8), 1)
    .setPrice(new CurrencyBundle().set("Power", 2e15).set("Skill", 10), 2)
    .setCreator("CoPKaDT")
    .addPlaceableArea("SlamoVillage")

    .trait(Dropper)
    .setDroplet(Droplet.SkillDroplet)
    .setDropRate(0.5)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();