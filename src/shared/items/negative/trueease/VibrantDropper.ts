import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Dropper("VibrantDropper")
.setName("Vibrant Dropper")
.setDescription("Might want to get rid of that Grass Conveyor now, this dropper produces $20K/droplet/8s.")
.setDifficulty(Difficulties.TrueEase)
.setPrice(new Price().setCost("Funds", new InfiniteMath([55, 9])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([260, 9])), 2)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.2, 12])), 3)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.VibrantDroplet)
.setDropRate(0.125)
.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2));