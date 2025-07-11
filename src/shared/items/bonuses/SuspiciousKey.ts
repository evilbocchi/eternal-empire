import Difficulty from "shared/Difficulty";
import Shop from "shared/item/Shop";
import MyKey from "shared/items/bonuses/MyKey";

export = new Shop("SuspiciousKey")
.setName("Suspicious Key")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    MyKey
]);