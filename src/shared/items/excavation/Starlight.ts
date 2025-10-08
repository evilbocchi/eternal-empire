import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "../bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Starlight")
    .setDescription(
        "Solidified beams harvested in the upper atmosphere. Emits a gentle glow that amplifies photonic machinery.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
