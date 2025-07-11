import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import { LaserFan } from "shared/item/Special";
import Price from "shared/Price";

export = new Conveyor(script.Name)
    .setName("Droplet Turbine")
    .setDescription(`A small item attachable next to conveyors that pushes droplets in its direction.`)
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new Price().setCost("Power", 20e21), 1, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("superGirlygamer8o")

    .setSpeed(20)
    .onLoad((model, item) => LaserFan.load(model, item, 80));