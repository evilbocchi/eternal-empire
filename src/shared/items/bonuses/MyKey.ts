import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("My Key.")
.setDescription("Just for me.")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Power", 1), 1);