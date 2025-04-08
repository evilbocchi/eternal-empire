import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Damager from "shared/item/traits/special/Damager";
import Upgrader from "shared/item/traits/Upgrader";
import Quartz from "shared/items/excavation/Quartz";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Elevated Coin Killer")
    .setDescription("A hastened death. %add% in exchange for %hp_add%.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Bitcoin", 20000000))
    .setRequiredItemAmount(Quartz, 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("eeeesdfew")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Bitcoin", 3.5))

    .trait(Damager)
    .setDamage(50)

    .trait(Conveyor)
    .setSpeed(10)

    .exit();