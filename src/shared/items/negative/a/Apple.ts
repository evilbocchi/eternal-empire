import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Apple")
    .setDescription("The Slamos' favorite past-time snack. Grows extraordinarily well in Slamo Village.")
    .setDifficulty(Difficulty.A)
    .persists();
