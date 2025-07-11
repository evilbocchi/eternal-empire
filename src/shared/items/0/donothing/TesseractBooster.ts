import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Charger from "shared/item/Charger";

export = new Charger(script.Name)
.setName("Tesseract Booster")
.setDescription("Does what it says, boosting Dark Matter gain of tesseracts in a 12 stud radius by x2.")
.setDifficulty(Difficulty.DoNothing)
.setPrice(new Price().setCost("Bitcoin", 2600), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setCreator("emoronq2k")

.setRadius(12)
.setMul(new Price().setCost("Dark Matter", 2));