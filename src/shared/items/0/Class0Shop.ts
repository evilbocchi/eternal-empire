import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Shop from "shared/item/Shop";
import SpatialDropper from "shared/items/0/astronomical/SpatialDropper";
import SpatialFurnace from "shared/items/0/astronomical/SpatialFurnace";
import BasicPrinter from "shared/items/0/millisecondless/BasicPrinter";
import BasicTesseract from "shared/items/0/millisecondless/BasicTesseract";
import HandCrankDropperV2 from "shared/items/0/millisecondless/HandCrankDropperV2";
import NormalReactor from "shared/items/0/millisecondless/NormalReactor";
import SlamoClicker from "shared/items/0/millisecondless/SlamoClicker";
import StrongCondenser from "shared/items/0/millisecondless/StrongCondenser";
import ImprovedTesseract from "shared/items/0/win/ImprovedTesseract";

export = new Shop("Class0Shop")
.setName("Class 0 Shop")
.setDescription("Buy your favorite Millisecondless to Spontaneous items here! You can get two of this shop.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea(AREAS.BarrenIslands)
.addPlaceableArea(AREAS.SlamoVillage)
.setPrice(new Price().setCost("Skill", 0), 1, 2)
.setItems([
    BasicPrinter,
    BasicTesseract,
    HandCrankDropperV2,
    NormalReactor,
    StrongCondenser,
    SlamoClicker,
    SpatialDropper,
    SpatialFurnace,
    ImprovedTesseract
]);