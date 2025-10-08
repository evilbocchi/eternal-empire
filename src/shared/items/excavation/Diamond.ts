import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Sapphire from "shared/items/excavation/Sapphire";

export = new Item(script.Name)
    .setName("Diamond")
    .setDescription(
        "Harder than any alloy known to mortals; its faultless facets make it perfect for high-pressure condensers and reactors.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Sapphire, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
