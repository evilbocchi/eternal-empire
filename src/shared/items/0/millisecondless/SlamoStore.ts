import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Class0Shop from "../Class0Shop";
import Glass from "./Glass";
import Stone from "./Stone";
import Wood from "./Wood";

export = new Item(script.Name)
    .setName("Slamo Store")
    .setDifficulty(Difficulty.Millisecondless)

    .trait(Shop)
    .setItems([Class0Shop, Wood, Stone, Glass])

    .exit();
