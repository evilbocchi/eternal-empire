import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Stone")
    .setDescription("A basic crafting resource, found littered everywhere around the world.")
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
