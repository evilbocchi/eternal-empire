import Difficulties from "shared/difficulty/Difficulties";
import Shop from "shared/item/Shop";
import Stud from "./Stud";

export = new Shop("SuspiciousStud")
.setName("Suspicious Stud")
.setDifficulty(Difficulties.Bonuses)
.setItems([
    Stud
]);