import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Item from "shared/item/Item";

export = new Item("VeryNiceTower")
.setName("30/30 rated tower :SHOCK:")
.setDescription("you will not last 5 SECONDS in this tower")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Funds", 10), 1)
