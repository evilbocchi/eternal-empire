import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import LaserFan from "../unimpossible/LaserFan";

export = new Upgrader("LaserTunnel")
.setName("Laser Tunnel")
.setDescription("No more convoluted structures to accomodate for the Laser Fans anymore. Boosts Funds gain by 10x and Power gain by 3x.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Power", new InfiniteMath([3.3, 9])), 1)
.setRequiredItemAmount(LaserFan, 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 10).setCost("Power", 3))
.setSpeed(2);