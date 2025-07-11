import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";

export = new Dropper("OverusedAmethystDropper")
.setName("Overused Amethyst Dropper")
.setDescription("Once used by the ancient Slamos in 700 B, this droplet still holds up and produces %val% droplets per second.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 14e15).setCost("Power", 7400000), 1)
.setPrice(new Price().setCost("Funds", 34e15).setCost("Power", 15200000), 2)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.RustyAmethystDroplet)
.setDropRate(1)