import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import { OnoeNum } from "@antivivi/serikanum";

export = new Upgrader("AdvancedRefiner")
.setName("Advanced Refiner")
.setDescription("Boosts Funds and Power gain of droplets passing through this upgrader by 1.75x.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Funds", 4.5e12), 1)
.setPrice(new Price().setCost("Funds", 8.1e12), 2)
.setPrice(new Price().setCost("Funds", 16.3e12), 3)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 1.75).setCost("Power", 1.75));