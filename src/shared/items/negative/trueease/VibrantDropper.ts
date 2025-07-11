import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Dropper(script.Name)
.setName("Vibrant Dropper")
.setDescription("Might want to get rid of that Grass Conveyor now, this dropper produces %val% droplets every 8 seconds.")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", 55e9), 1)
.setPrice(new Price().setCost("Funds", 220e9), 2)
.setPrice(new Price().setCost("Funds", 1.2e12), 3)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.VibrantDroplet)
.setDropRate(0.125)
.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2));