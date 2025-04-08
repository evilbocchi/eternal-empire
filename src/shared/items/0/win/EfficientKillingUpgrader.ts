import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";
import Damager from "shared/item/traits/special/Damager";

export = new Item("EfficientKillingUpgrader")
    .setName("Efficient Killing Upgrader")
    .setDescription("Small yet deadly. Does %hp_add% to droplets, but boosts Funds and Power by 1.95x.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Funds", 3.85e24), 1)
    .setPrice(new CurrencyBundle().set("Funds", 5.81e24), 2)
    .setPrice(new CurrencyBundle().set("Funds", 8.63e24), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.95).set("Power", 1.95))

    .trait(Damager)
    .setDamage(35)

    .trait(Conveyor)
    .setSpeed(5)

    .exit();