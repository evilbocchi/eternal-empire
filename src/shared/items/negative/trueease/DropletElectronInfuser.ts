import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader(script.Name)
.setName("Droplet Electron Infuser")
.setDescription("Now we're talking. Droplets passing through this upgrader gain %add% in value.")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Power", 1500), 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(3)
.setAdd(new Price().setCost("Power", 2))
.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2));