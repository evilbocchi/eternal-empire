import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("GrassDropper")
.setName("Grass Dropper")
.setDescription("You need more grass. A Grass Droplet from this dropper touching a Grass Conveyor transforms it into a Massive Grass Droplet worth $550.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 34500000), 1)
.setPrice(new Price().setCost("Funds", 80000000), 2)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.NativeGrassDroplet)
.setDropRate(1);