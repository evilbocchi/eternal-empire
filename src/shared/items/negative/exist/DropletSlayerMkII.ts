import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import { DropletSlayer } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import DropletSlayerMkI from "../negativity/DropletSlayerMkI";

export = new Upgrader("DropletSlayerMkII")
.setName("Droplet Slayer Mk. II")
.setDescription("This is getting ridiculous. Literally hire a noob to slay droplets for you, multiplying their value by ($4, 2 W)x every 4 seconds.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([12.1, 15])), 1)
.setRequiredItemAmount(DropletSlayerMkI, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 3))
.onLoad((model, _utils, item) => DropletSlayer.noob(model, item, 4));