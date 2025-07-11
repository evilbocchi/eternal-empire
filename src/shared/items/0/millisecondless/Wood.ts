import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("Wood")
.setDescription("Exactly what it says. Wood.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea("SlamoVillage")
.setPrice(new Price().setCost("Funds", 1e24), 1, 10);