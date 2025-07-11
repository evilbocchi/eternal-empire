import Price from "shared/Price";
import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("Stud")
.setDescription("Stud")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Funds", 1), 1);