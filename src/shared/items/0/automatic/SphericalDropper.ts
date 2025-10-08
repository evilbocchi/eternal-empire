import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";

export = new Item(script.Name)
    .setName("Spherical Dropper")
    .setDescription("Produces %val% spheres that start at %health%. You may want to heal them up...")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Skill", 4000000), 1)
    .setCreator("GIDS214")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.SphericalDroplet)
    .setDropRate(0.5)

    .exit();
