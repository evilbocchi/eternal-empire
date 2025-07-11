import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Printer from "shared/item/Printer";

export = new Printer(script.Name)
.setName("Basic Printer")
.setDescription("Cheap and easy! Able to save placed items and their positions in Barren Islands, which can be loaded at any time. Any items that are not available when loading will be ignored.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", 800e18), 1)
.addPlaceableArea("SlamoVillage")
.setArea("BarrenIslands")