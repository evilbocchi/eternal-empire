import Price from "shared/Price";
import Difficulty from "shared/Difficulty";
import Item from "shared/item/Item";

export = new Item("Stud")
.setName("Stud")
.setDescription("Stud")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Funds", 1), 1);