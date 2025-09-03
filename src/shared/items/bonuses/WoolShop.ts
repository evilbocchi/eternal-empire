import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Wool from "shared/items/negative/a/Wool";
import XLWool from "shared/items/negative/relax/XLWool";

export = new Item(script.Name)
    .setName("Grass Shop")
    .setDescription("A shop that sells wool.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .setItems([Wool, XLWool])

    .exit();
