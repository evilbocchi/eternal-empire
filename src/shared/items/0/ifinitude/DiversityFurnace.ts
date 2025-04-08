import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import DualDropper from "shared/items/negative/a/DualDropper";
import CurrencyBundle from "shared/currency/CurrencyBundle";

const mul = new CurrencyBundle().set("Bitcoin", 4);

export = new Item(script.Name)
    .setName("Diversity Furnace")
    .setDescription(`This amalgamation of an item is at least better than that ${DualDropper.name}... %mul% value to droplets for both the furnace and upgrader.`)
    .setDifficulty(Difficulty.Ifinitude)
    .setRequiredItemAmount(AdvancedBlankEssence, 1)
    .setPrice(new CurrencyBundle().set("Power", 500e15).set("Skill", 20), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")

    .trait(Furnace)
    .setMul(mul)

    .trait(Upgrader)
    .setMul(mul)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();