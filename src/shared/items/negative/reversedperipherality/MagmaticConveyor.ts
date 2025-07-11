import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Droplet from "shared/item/Droplet";
import Transformer from "shared/item/Transformer";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Transformer("MagmaticConveyor")
.setName("Magmatic Conveyor")
.setDescription("It's time to heat up. Cleans amethyst droplets for $78K value. Anything else will be burned to char. :( That's it for the update!")
.setDifficulty(Difficulties.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([400, 15])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5)
.setResult(Droplet.Char)
.setResult(Droplet.RustyAmethystDroplet, Droplet.AmethystDroplet);