import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Grass")
    .setDescription("A common plant that grows in many places. It can be harvested for various purposes, such as crafting or decoration.")
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();