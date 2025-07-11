import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Charger from "shared/item/Charger";

export = new Charger(script.Name)
.setName("Strong Charger")
.setDescription("Boosts Power gain of generators within 12 studs radius of this charger by 6x. We need to charge.")
.setDifficulty(Difficulty.JustAir)
.setPrice(new Price().setCost("Funds", 16e30).setCost("Power", 300e15), 1)
.setPrice(new Price().setCost("Funds", 44e30).setCost("Power", 700e15), 2)
.addPlaceableArea("BarrenIslands")

.setRadius(12)
.setMul(new Price().setCost("Power", 6));