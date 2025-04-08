import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Industrial Overpass")
    .setDescription("A convoluted cross-over. Both lasers add %add% in droplet value.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Power", 200))
    .setRequiredItemAmount(ExcavationStone, 30)
    .setRequiredItemAmount(WhiteGem, 15)
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Power", 5))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();