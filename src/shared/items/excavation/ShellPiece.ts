import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Shell Piece")
    .setDescription(
        "Fragments of an ancient exoshell, coated in pearlescent dust. Holds remarkable pressure tolerance.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
