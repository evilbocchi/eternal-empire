import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Lost Pendant")
    .setDescription("Located atop a peculiar hill. Seems to have no materialistic value.")
    .setDifficulty(Difficulty.Winsome)
    .persists();
