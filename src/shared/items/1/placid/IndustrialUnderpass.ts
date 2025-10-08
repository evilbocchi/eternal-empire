import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CorruptedGrass from "shared/items/0/happylike/CorruptedGrass";
import StaleWood from "shared/items/negative/tfd/StaleWood";
import Jade from "shared/items/excavation/Jade";

export = new Item(script.Name)
    .setName("Industrial Underpass")
    .setDescription(
        "The next iteration, naturally. Each laser gives %add%. If you ever actually need this, you're screwed.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1e6))
    .setRequiredItemAmount(StaleWood, 300)
    .setRequiredItemAmount(CorruptedGrass, 1)
    .setRequiredItemAmount(Jade, 5)
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Bitcoin", 200))

    .exit();
