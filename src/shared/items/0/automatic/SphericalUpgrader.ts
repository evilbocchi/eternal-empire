import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Damager from "shared/item/traits/special/Damager";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Spherical Healer")
    .setDescription("Heals droplets for %hp_add%.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Skill", 4000000), 1)
    .setCreator("GIDS214")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Upgrader)
    
    .trait(Damager)
    .setDamage(-20)

    .trait(Conveyor)
    .setSpeed(5)

    .exit();