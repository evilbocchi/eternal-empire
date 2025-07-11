import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { DropletSlayer } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import DropletSlayerMkI from "../negativity/DropletSlayerMkI";

export = new Upgrader(script.Name)
    .setName("Droplet Slayer Mk. II")
    .setDescription("This is getting ridiculous. Literally hire a noob to slay droplets for you, multiplying their value by %mul% every 4 seconds.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new Price().setCost("Funds", 12.1e15), 1)
    .setRequiredItemAmount(DropletSlayerMkI, 1)
    .addPlaceableArea("BarrenIslands")

    .setMul(new Price().setCost("Funds", 4).setCost("Power", 2))
    .onLoad((model, item) => DropletSlayer.noob(model, item, 4))
    .onClientLoad((model) => DropletSlayer.noobClient(model));