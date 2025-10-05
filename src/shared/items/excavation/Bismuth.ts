import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Bismuth")
    .setDescription(
        "A divine, iridescent metal incomprehensible to most. Used in the construction of the Iridiscent Tesseract and other empyrean artifacts.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
