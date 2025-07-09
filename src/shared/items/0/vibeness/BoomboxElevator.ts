import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import DropperBooster from "shared/item/traits/dropper/DropperBooster";
import Gold from "shared/items/excavation/Gold";
import CorruptedGrass from "shared/items/excavation/harvestable/CorruptedGrass";
import Quartz from "shared/items/excavation/Quartz";

export = new Item(script.Name)
    .setName("Boombox Elevator")
    .setDescription("Elevate your droplets while listening to some vibey tunes! If you place droppers in front of the boombox, they might also enjoy these tunes and have better production as well...")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Skill", 6000000).set("Power", 250e24).set("Dark Matter", 25e27), 1)
    .setRequiredItemAmount(Quartz, 2)
    .setRequiredItemAmount(Gold, 6)
    .setRequiredItemAmount(CorruptedGrass, 2)
    .addPlaceableArea("BarrenIslands")
    .setCreator("sanjay2133")
    .persists()

    .trait(Conveyor)
    .setSpeed(3)

    .trait(DropperBooster)
    .setDropRateMultiplier(1.25)

    .exit();