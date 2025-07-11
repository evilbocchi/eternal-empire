import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Charger from "shared/item/Charger";

export = new Charger("TesseractBooster")
.setName("Tesseract Booster")
.setDescription("Does what it says, boosting Dark Matter gain of tesseracts in a 12 stud radius by 2x.")
.setDifficulty(Difficulty.DoNothing)
.setPrice(new Price().setCost("Bitcoin", 2600), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.setCreator("emoronq2k")

.setRadius(12)
.setMul(new Price().setCost("Dark Matter", 2));