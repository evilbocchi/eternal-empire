import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import WinsomeSpeck from "shared/items/0/winsome/WinsomeSpeck";

export = new Item(script.Name)
    .setName("Winsome Coagulate")
    .setDescription(
        "A viscous, honey-like substance that seems to shimmer with an inner light. It is said to be a byproduct of the Winsome's unique biology, and is highly sought after for its alchemical properties.",
    )
    .setDifficulty(Difficulty.Winsome)
    .setRequiredItemAmount(WinsomeSpeck, 20)
    .persists();
