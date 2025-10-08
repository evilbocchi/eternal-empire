import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Wool from "shared/items/negative/a/Wool";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";

export = new Item(script.Name)
    .setName("Industrial Overpass")
    .setDescription("A convoluted cross-over. Both lasers add %add% in droplet value.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Power", 1000000))
    .setRequiredItemAmount(Wool, 20)
    .setRequiredItemAmount(ExcavationStone, 30)
    .setRequiredItemAmount(WhiteGem, 15)
    .addPlaceableArea("BarrenIslands")
    .soldAt(CraftingTable)
    .setCreator("simple13579")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Power", 5))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
