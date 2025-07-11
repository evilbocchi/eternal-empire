import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor(script.Name)
.setName("Conveyor Corner")
.setDescription("A conveyor invented by Move-Your-Droplets™. Advertised to 'rotate any droplet, anytime.' Only goes clockwise unfortunately.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 90), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(5);