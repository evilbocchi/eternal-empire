import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("memories...")
    .setDescription("Feels so oddly familiar to you, it gives you the shivers. .. ...restores %hp_add% to droplets.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Funds", 400e27), 1)
    .setPrice(new CurrencyBundle().set("Funds", 4e30), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")

    .trait(Upgrader)

    .trait(Damager)
    .setDamage(-25)

    .trait(Conveyor)
    .setSpeed(2)

    .exit();
