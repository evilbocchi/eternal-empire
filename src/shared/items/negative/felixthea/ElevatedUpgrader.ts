import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader("ElevatedUpgrader")
.setName("Elevated Upgrader")
.setDescription("A little high... Increases droplet value by %mul%x.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 25e12), 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2));