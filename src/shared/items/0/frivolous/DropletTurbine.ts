import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import LaserFan from "shared/item/traits/other/LaserFan";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Droplet Turbine")
    .setDescription(`A small item attachable next to conveyors that pushes droplets in its direction.`)
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Power", 20e21), 1, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .setCreator("superGirlygamer8o")

    .trait(Conveyor)
    .setSpeed(20)
    .exit()

    .trait(LaserFan)
    .setSpeed(80)

    .exit();
