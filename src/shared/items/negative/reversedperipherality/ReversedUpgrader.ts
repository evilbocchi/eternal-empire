import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader("ReversedUpgrader")
.setName("Reversed Upgrader")
.setDescription("An elevated upgrader that does not appreciate Power, boosting Funds by 2x but nerfing Power by 0.5x in droplet value.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 1.45e18), 1)
.addPlaceableArea("BarrenIslands")
.setCreator("CoPKaDT")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2).setCost("Power", 0.5));