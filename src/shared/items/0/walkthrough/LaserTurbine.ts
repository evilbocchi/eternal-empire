import Difficulty from "@antivivi/jjt-difficulties";
import { LaserFan } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
    .setName("Laser Turbine")
    .setDescription(`We heard you missed your old Laser Fans, so here's an "upgraded" model! Each fan blade gives %mul% compounding but can only hit droplets on raised conveyors.`)
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new Price().setCost("Funds", 50e33), 1)
    .setPrice(new Price().setCost("Funds", 150e33), 2)
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")

    .setMul(new Price().setCost("Funds", 1.2))
    .onLoad((model, item) => LaserFan.load(model, item, 5));