import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("ReversedUpgrader")
.setName("Reversed Upgrader")
.setDescription("An elevated upgrader that does not appreciate Power, boosting Funds by 2x but nerfing Power by 0.5x in droplet value.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.45, 18])), 1)
.addPlaceableArea(AREAS.BarrenIslands)
.setCreator("CoPKaDT")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2).setCost("Power", 0.5));