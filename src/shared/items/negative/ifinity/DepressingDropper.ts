import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";

export = new Dropper("DepressingDropper")
.setName("Depressing Dropper")
.setDescription("The best item in the game. Produces $0.01 droplets per second.")
.setDifficulty(Difficulty.Ifinity)
.setPrice(new Price().setCost("Funds", 450e18), 1)
.setPrice(new Price().setCost("Funds", 4.5e21), 2)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.DepressingDroplet)
.setDropRate(1)