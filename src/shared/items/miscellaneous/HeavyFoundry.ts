import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("HeavyFoundry")
.setName("Heavy Foundry")
.setDescription("A large furnace that's less of a furnace and more like an oven. Has a %mul%x boost, but reduces 0.1 for each blocked vent.")
.setDifficulty(Difficulty.Miscellaneous)
.markPlaceableEverywhere()

.setSpeed(3)
.setMul(new Price().setCost("Funds", 1.2));