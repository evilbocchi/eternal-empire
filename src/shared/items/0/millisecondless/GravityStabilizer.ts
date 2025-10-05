import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Gravity Stabilizer")
    .setDescription("This thing keeps you grounded. Or un-grounded? Physics is fake anyway.")
    .setDifficulty(Difficulty.Millisecondless)
    .persists();
