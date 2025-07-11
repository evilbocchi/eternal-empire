import Difficulty from "shared/Difficulty";
import Charger from "shared/item/Charger";
import Price from "shared/Price";

export = new Charger("IndustrialCharger")
.setName("Industrial Charger")
.setDescription("Invented yet again by Speed Bobs, this charger doesn't count towards any charge limits, but only boosts Power by 1.25x in a 8 stud radius.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", 1.8e18).setCost("Power", 1e9), 1)
.setPrice(new Price().setCost("Funds", 3.3e18).setCost("Power", 1.4e9), 2)
.addPlaceableArea("BarrenIslands")

.ignoresLimit(true)
.setRadius(8)
.setMul(new Price().setCost("Power", 1.25));
