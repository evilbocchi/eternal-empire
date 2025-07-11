import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Printer from "shared/item/Printer";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Printer("BasicPrinter")
.setName("Basic Printer")
.setDescription("Cheap and easy! Able to save placed items and their positions in Barren Islands, which can be loaded at any time. Any items that are not available when loading will be ignored.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", new InfiniteMath([800, 18])), 1)
.addPlaceableArea(AREAS.SlamoVillage)
.setArea("BarrenIslands")