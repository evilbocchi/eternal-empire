import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("100K Visits Trophy")
.setDescription("To commemorate 100K visits!")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Funds", 100000), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage");
