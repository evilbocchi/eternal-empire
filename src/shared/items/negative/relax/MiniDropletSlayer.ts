import Difficulty from "@antivivi/jjt-difficulties";
import { DropletSlayer } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
    .setName("Mini Droplet Slayer")
    .setDescription("Mini noobs slaying droplets for $1.5x/2s. Only upgrades elevated droplets.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new Price().setCost("Funds", 6.2e18), 1)
    .setPrice(new Price().setCost("Funds", 20e18), 2)
    .addPlaceableArea("BarrenIslands")

    .setMul(new Price().setCost("Funds", 1.5))
    .onLoad((model, item) => DropletSlayer.noob(model, item, 2))
    .onClientLoad((model) => DropletSlayer.noobClient(model));