import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Sky Pass")
    .setDescription(
        "An exclusive pass to the Sky Pavilion. It's laminated and everything. Flex on the ground dwellers.",
    )
    .setDifficulty(Difficulty.Millisecondless)
    .persists();
