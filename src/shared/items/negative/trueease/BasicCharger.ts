import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Charger from "shared/item/Charger";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Charger("BasicCharger")
.setName("Basic Charger")
.setDescription("Boosts Power gain of generators within 10 studs radius of this charger by 2x... at the cost of $20M/s.")
.setDifficulty(Difficulties.TrueEase)
.setPrice(new Price().setCost("Funds", 3500000000).setCost("Power", 100), 1)
.setPrice(new Price().setCost("Funds", 5000000000).setCost("Power", 200), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2))
.setRadius(10)
.setFormula((val) => val.mul(new Price().setCost("Power", 2)))
.setMaintenance(new Price().setCost("Funds", 20000000));