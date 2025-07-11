import Difficulty from "@antivivi/jjt-difficulties";
import { LaserFan } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
    .setName("Laser Fan")
    .setDescription("Increases droplet value by %mul% compounding per blade.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new Price().setCost("Funds", 150000), 1)
    .setPrice(new Price().setCost("Funds", 350000), 2)
    .addPlaceableArea("BarrenIslands")

    .setMul(new Price().setCost("Funds", 1.3))
    .onLoad((model, item) => LaserFan.load(model, item));