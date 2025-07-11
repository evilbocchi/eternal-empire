import Difficulty from "shared/Difficulty";
import { DropletSlayer } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader("MiniDropletSlayer")
.setName("Mini Droplet Slayer")
.setDescription("Mini noobs slaying droplets for $1.5x/2s. Only upgrades elevated droplets.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", 6.2e18), 1)
.setPrice(new Price().setCost("Funds", 20e18), 2)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 1.5))
.onLoad((model, _utils, item) => DropletSlayer.noob(model, item, 2));