import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Spatial Dropper")
    .setDescription(
        "A dropper placeable in Slamo Village producing %val% droplets every 2 seconds, saving between skillifications!",
    )
    .setDifficulty(Difficulty.Astronomical)
    .setPrice(new CurrencyBundle().set("Skill", 2), 1)
    .setPrice(new CurrencyBundle().set("Skill", 3), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Dropper)
    .setDroplet(Droplet.SpatialDroplet)
    .setDropRate(0.5)

    .exit();
