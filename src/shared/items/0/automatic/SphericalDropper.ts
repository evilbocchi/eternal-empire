import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Spherical Dropper")
    .setDescription("Produces %val% spheres that start at %health%. You may want to heal them up...")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Skill", 4000000), 1)
    .setCreator("GIDS214")

    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.SphericalDroplet)
    .setDropRate(0.5)

    .exit();