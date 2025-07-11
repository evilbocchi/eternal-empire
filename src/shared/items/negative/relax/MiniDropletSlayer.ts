import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import { DropletSlayer } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("MiniDropletSlayer")
.setName("Mini Droplet Slayer")
.setDescription("Mini noobs slaying droplets for $1.5x/2s. Only upgrades elevated droplets.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", new InfiniteMath([6.2, 18])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([20, 18])), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 1.5))
.onLoad((model, _utils, item) => DropletSlayer.noob(model, item, 2));