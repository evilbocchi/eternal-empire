import { ReplicatedStorage } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import AdvancedRefiner from "../a/AdvancedRefiner";

export = new Upgrader("PurifiersRefiner")
.setName("Purifier's Refiner")
.setDescription("Exchange one of your Advanced Refiners for a better refiner that also adds +1 Purifier Clicks value to droplets.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([4, 15])), 1)
.setRequiredItemAmount(AdvancedRefiner, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setAdd(new Price().setCost("Purifier Clicks", 1))
.setMul(new Price().setCost("Funds", 1.75).setCost("Power", 1.75));