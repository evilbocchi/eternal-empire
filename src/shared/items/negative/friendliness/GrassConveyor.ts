import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Transformer from "shared/item/traits/upgrader/Transformer";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Grass Conveyor")
    .setDescription(
        "It's time to touch some grass. Converts all droplets passing through this conveyor into Grass Droplets worth $120.",
    )
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 10000000), 1, 3)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Transformer)
    .setSpeed(5)
    .setResult(Droplet.GrassDroplet)
    .setResult(Droplet.MassiveGrassDroplet, Droplet.NativeGrassDroplet)

    .exit();
