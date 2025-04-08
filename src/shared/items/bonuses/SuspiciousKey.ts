import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import MyKey from "shared/items/bonuses/MyKey";

export = new Item(script.Name)
    .setName("Suspicious Key")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .setItems([
        MyKey
    ])

    .exit();