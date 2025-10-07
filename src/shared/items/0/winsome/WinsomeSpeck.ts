import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Winsome Speck")
    .setDescription(
        "A common substance secreted by Slamos while they are asleep. While the Skill level of the average Slamo is generally slightly above Winsome, excess Skill released by this peculiar species usually breaks down into this exact form.",
    )
    .setDifficulty(Difficulty.Winsome)
    .persists();
