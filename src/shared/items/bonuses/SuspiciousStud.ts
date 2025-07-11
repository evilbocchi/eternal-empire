import Difficulty from "shared/Difficulty";
import Shop from "shared/item/Shop";
import Stud from "shared/items/bonuses/Stud";

export = new Shop("SuspiciousStud")
.setName("Suspicious Stud")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    Stud
]);