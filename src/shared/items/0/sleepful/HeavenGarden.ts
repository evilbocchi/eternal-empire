import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item("HeavenGarden")
    .setName("Heaven's Garden")
    .setDescription(
        "Hurts so bad... Droplets are dealt %hp_add%, but gain %mul% value. No idea why heaven is so cruel.",
    )
    .setDifficulty(Difficulty.Sleepful)
    .setPrice(new CurrencyBundle().set("Power", 1.2e15).set("Skill", 5), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Power", 2.5).set("Bitcoin", 2))

    .trait(Damager)
    .setDamage(62.5)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
