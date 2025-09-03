import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Damager from "shared/item/traits/upgrader/Damager";

export = new Item(script.Name)
    .setName("Killbrick Upgrader")
    .setDescription(
        "Does %hp_add% to droplets, but boosts droplets by %mul%. Droplet value scales with its health by the following equation: &lt;health / 100&gt;, capping at 1x. Health defaults to 100.",
    )
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 38.5e18), 1)
    .setPrice(new CurrencyBundle().set("Funds", 58.1e18), 2)
    .setPrice(new CurrencyBundle().set("Funds", 86.3e18), 3)
    .setPrice(new CurrencyBundle().set("Funds", 110.7e18), 4)
    .setPrice(new CurrencyBundle().set("Funds", 148.2e18), 5)
    .setPrice(new CurrencyBundle().set("Funds", 185.1e18), 6)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.4).set("Power", 1.4))

    .trait(Damager)
    .setDamage(20)

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
