import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Stud from "shared/items/bonuses/Stud";

export = new Item(script.Name)
    .setName("Suspicious Stud")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .exit();
