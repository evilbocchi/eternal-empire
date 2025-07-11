import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item("Glass")
.setName("Glass")
.setDescription("It didn't lie. This really is glass, costing quite the fortune.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea("SlamoVillage")
.setPrice(new Price().setCost("Funds", 1e27).setCost("Power", 1e18), 1, 10);