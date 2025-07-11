import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader("FrozenGate")
.setName("Frozen Gate")
.setDescription("The hands of time stay frozen for this elusive machinery, boosting droplet values by %mul%x.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", 1.38e21), 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(2)
.setMul(new Price().setCost("Funds", 4).setCost("Power", 4));