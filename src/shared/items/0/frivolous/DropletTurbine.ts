import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import { LaserFan } from "shared/item/traits/special/LaserFan";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Droplet Turbine")
    .setDescription(`A small item attachable next to conveyors that pushes droplets in its direction.`)
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Power", 20e21), 1, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("superGirlygamer8o")

    .trait(Conveyor)
    .setSpeed(20)
    .exit()

    .onLoad((model, item) => LaserFan.load(model, item, 80));

