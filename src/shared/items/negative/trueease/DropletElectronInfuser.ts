import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader("DropletElectronInfuser")
.setName("Droplet Electron Infuser")
.setDescription("Now we're talking. Droplets passing through this upgrader gain 2 W in value.")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Power", 1500), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(3)
.setAdd(new Price().setCost("Power", 2))
.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2));