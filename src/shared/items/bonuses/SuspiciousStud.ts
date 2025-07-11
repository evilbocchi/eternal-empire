import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import Stud from "shared/items/bonuses/Stud";

export = new Shop(script.Name)
.setName("Suspicious Stud")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    Stud
]);