import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item("Stone")
.setName("Rock")
.setDescription("What's better than wood? Rock.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea("SlamoVillage")
.setPrice(new Price().setCost("Power", 1e15), 1, 10);