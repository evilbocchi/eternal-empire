import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor("TheFirstConveyor")
.setName("The First Conveyor")
.setDescription("Moves stuff from one place to another. Use this to push droplets into furnaces.")
.setDifficulty(Difficulties.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 5), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(6);