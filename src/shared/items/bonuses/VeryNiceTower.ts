import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Item from "shared/item/Item";

export = new Item("VeryNiceTower")
.setName("30/30 rated tower :SHOCK:")
.setDescription("you will not last 5 SECONDS in this tower")
.setDifficulty(Difficulties.Bonuses)
.setPrice(new Price().setCost("Funds", 10), 1)
.addPlaceableArea(AREAS.BarrenIslands);