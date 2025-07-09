import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Transformer from "shared/item/traits/upgrader/Transformer";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Grass Conveyor")
    .setDescription("It's time to touch some grass. Converts all droplets passing through this conveyor into Grass Droplets worth $120.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 10000000), 1, 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Transformer)
    .setSpeed(5)
    .setResult(Droplet.GrassDroplet)
    .setResult(Droplet.MassiveGrassDroplet, Droplet.NativeGrassDroplet)

    .exit();