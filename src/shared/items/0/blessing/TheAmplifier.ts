import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import InclinedRefiner from "shared/items/0/win/InclinedRefiner";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("The Amplifier")
.setDescription("This is THE Amplifier. There will only ever be one amplifier, and this is it. %mul% boost to droplets. You could call this a trade-off for the additive Funds boost the Inclined Refiner gives, but it really isn't.")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Skill", 30), 1)
.setRequiredItemAmount(InclinedRefiner, 1)
.setCreator("butterman_toast")
.addPlaceableArea("BarrenIslands")
.addPlaceableArea("SlamoVillage")
.persists("Skillification")

.setSpeed(5)
.setMul(new Price().setCost("Bitcoin", 2).setCost("Power", 2));