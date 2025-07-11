import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";

export = new Dropper(script.Name)
.setName("Overused Amethyst Dropper")
.setDescription("Once used by the ancient Slamos in 700 B, this droplet still holds up and produces %val% droplets per second.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 14e15).setCost("Power", 5500000), 1)
.setPrice(new Price().setCost("Funds", 34e15).setCost("Power", 15000000), 2)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.RustyAmethystDroplet)
.setDropRate(1)