import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import LaserFan from "../unimpossible/LaserFan";

export = new Upgrader(script.Name)
.setName("Laser Tunnel")
.setDescription("No more convoluted structures to accomodate for the Laser Fans anymore. Boost droplet value by %mul%.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Power", 3.3e9), 1)
.setRequiredItemAmount(LaserFan, 2)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 10).setCost("Power", 3))
.setSpeed(2);