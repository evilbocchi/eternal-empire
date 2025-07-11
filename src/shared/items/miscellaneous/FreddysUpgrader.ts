import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("FreddysUpgrader")
.setName("Freddy's Upgrader")
.setDescription("A well-built upgrader that adds $250 to droplet value.")
.setDifficulty(Difficulty.Miscellaneous)
.markPlaceableEverywhere()

.setSpeed(3)
.setAdd(new Price().setCost("Funds", 250));