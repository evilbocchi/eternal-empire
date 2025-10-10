import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";

export = new Item(script.Name)
    .setName("Crystal Ingot")
    .setDescription("A refined ingot made from pure crystal.")
    .setDifficulty(Difficulty.Unimpossible)
    .setRequiredItemAmount(Crystal, 6)
    .placeableEverywhere()
    .persists();
