import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Grass Shop")
    .setDescription("A shop that sells wool.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .exit();
