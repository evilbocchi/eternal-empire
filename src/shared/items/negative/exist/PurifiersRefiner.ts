import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import AdvancedRefiner from "shared/items/negative/a/AdvancedRefiner";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Purifier's Refiner")
.setDescription("Upgrade one of your Advanced Refiners, keeping its original boosts while adding +1 Purifier Clicks value to droplets.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", 4e15), 1)
.setRequiredItemAmount(AdvancedRefiner, 1)
.addPlaceableArea("BarrenIslands")

.setAdd(new Price().setCost("Purifier Clicks", 1))
.setMul(new Price().setCost("Funds", 1.75).setCost("Power", 1.75));