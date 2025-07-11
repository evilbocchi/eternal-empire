import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Charger from "shared/item/Charger";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Charger("BasicCharger")
.setName("Basic Charger")
.setDescription("Boosts gain of generators within %radius% studs radius of this charger by %mul%x. Generators can only be charged two times.")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", 3500000000).setCost("Power", 100), 1)
.setPrice(new Price().setCost("Funds", 5000000000).setCost("Power", 160), 2)
.setPrice(new Price().setCost("Funds", 12000000000).setCost("Power", 300), 3)
.addPlaceableArea("BarrenIslands")

.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2))
.setRadius(9)
.setMul(new Price().setCost("Power", 2));