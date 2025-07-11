import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Item from "shared/item/Item";

export = new Item("100KVisitsTrophy")
.setName("100K Visits Trophy")
.setDescription("To commemorate 100K visits!")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Funds", 100000), 1)
.addPlaceableArea(AREAS.BarrenIslands)
.addPlaceableArea(AREAS.SlamoVillage);