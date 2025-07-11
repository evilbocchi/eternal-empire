import Price from "shared/Price";
import Difficulties from "shared/difficulty/Difficulties";
import Item from "shared/item/Item";

export = new Item("Stud")
.setName("Stud")
.setDescription("Stud")
.setDifficulty(Difficulties.Bonuses)
.setPrice(new Price().setCost("Funds", 1), 1);