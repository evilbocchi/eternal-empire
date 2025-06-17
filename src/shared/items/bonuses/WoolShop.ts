import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Wool from "shared/items/miscellaneous/Wool";
import XLWool from "shared/items/miscellaneous/XLWool";

export = new Item(script.Name)
    .setName("Grass Shop")
    .setDescription("A shop that sells wool.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .setItems([
        Wool,
        XLWool
    ])

    .exit();