import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Uranium from "shared/items/excavation/Uranium";

export = new Item(script.Name)
    .setName("Bismuth")
    .setDescription(
        "A divine, iridescent metal incomprehensible to most. Used in the construction of the Iridiscent Tesseract and other empyrean artifacts.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Uranium, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
