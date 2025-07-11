import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor("ConveyorCorner")
.setName("Conveyor Corner")
.setDescription("A conveyor invented by Move-Your-Droplets™. Advertised to 'rotate any droplet, anytime.' Only goes clockwise unfortunately.")
.setDifficulty(Difficulties.TheLowerGap)
.setPrice(new Price().setCost("Funds", 90), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5);