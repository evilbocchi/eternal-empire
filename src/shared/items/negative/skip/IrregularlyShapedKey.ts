import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Irregularly Shaped Key")
    .setDescription("A peculiar key shaped like a plus sign with a hole in the middle.")
    .setDifficulty(Difficulty.Skip)
    .persists();
