import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Crafting Shop")
    .setDescription("A shop that sells crafting tables.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .exit();
