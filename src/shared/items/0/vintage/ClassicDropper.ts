import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Classic Dropper")
    .setDescription("A slightly nostalgic Slamo Village dropper producing %val% droplets per second.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Skill", 25), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)
    .setCreator("emoronq2k")

    .trait(Dropper)
    .setDroplet(Droplet.ClassicDroplet)
    .setDropRate(0.5)

    .exit();
