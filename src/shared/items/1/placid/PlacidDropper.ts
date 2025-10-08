import Difficulty from "@rbxts/ejt";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Class1Shop from "../Class1Shop";

export = new Item(script.Name)
    .setName("Placid Dropper")
    .setDescription("The most generic dropper in existence. Produces droplets.")
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1, 3)
    .setCreator("hisroblcogood")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class1Shop)

    .trait(Dropper)
    .setDropRate(1)
    .setDroplet(Droplet.PlacidDroplet)

    .exit();
