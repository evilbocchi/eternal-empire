import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Transformer from "shared/item/Transformer";
import Price from "shared/Price";

export = new Transformer("MagmaticConveyor")
.setName("Magmatic Conveyor")
.setDescription("It's time to heat up. Cleans amethyst droplets for $78K value. Anything else will be burned to char. :(")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 1e18), 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setResult(Droplet.Char)
.setResult(Droplet.AmethystDroplet, Droplet.RustyAmethystDroplet);