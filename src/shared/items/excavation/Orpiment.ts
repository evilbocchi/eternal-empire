import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Orpiment")
    .setDescription(
        "A vivid scarlet mineral that leaves a metallic sheen wherever it touches. Handle with care—its fumes are legendary.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
