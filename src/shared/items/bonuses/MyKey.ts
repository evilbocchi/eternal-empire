import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item("MyKey")
.setName("My Key.")
.setDescription("Just for me.")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Power", 1), 1);