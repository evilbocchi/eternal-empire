import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import UnleashedConveyor from "shared/items/0/locomotion/UnleashedConveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Mini Conveyor")
.setDescription(`The junior to ${UnleashedConveyor.name}. Not much use other than inflating item count.`)
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Funds", 2e30), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);