import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import MyKey from "shared/items/bonuses/MyKey";

export = new Shop(script.Name)
.setName("Suspicious Key")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    MyKey
]);