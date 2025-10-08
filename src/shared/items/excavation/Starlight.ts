import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Diamond from "shared/items/excavation/Diamond";

export = new Item(script.Name)
    .setName("Starlight")
    .setDescription(
        "Solidified beams harvested in the upper atmosphere. Emits a gentle glow that amplifies photonic machinery.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Diamond, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
