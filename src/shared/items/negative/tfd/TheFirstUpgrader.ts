import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("TheFirstUpgrader")
.setName("The First Upgrader")
.setDescription("Increases the monetary value of droplets. Pass droplets through the laser to increase revenue.")
.setDifficulty(Difficulties.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 30), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(3)
.setAdd(new Price().setCost("Funds", 4));