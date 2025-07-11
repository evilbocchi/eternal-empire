import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Charger from "shared/item/Charger";

export = new Charger("AdvancedCharger")
.setName("Advanced Charger")
.setDescription("Boosts Power gain of generators within 11 studs radius of this charger by 4x.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 108e12).setCost("Power", 102000), 1)
.setPrice(new Price().setCost("Funds", 226e12).setCost("Power", 320200), 2)
.addPlaceableArea("BarrenIslands")

.setRadius(11)
.setMul(new Price().setCost("Power", 4));