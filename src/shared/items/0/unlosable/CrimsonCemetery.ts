import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";
import Damager from "shared/item/traits/special/Damager";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Crimson Cemetery")
    .setDescription("A bloody moon dyes a forgotten cemetery in crimson red. Deals %hp_add% to droplets for a %mul% gain, though space constraints may pose a challenge...")
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Power", 2e21), 2)
    .setRequiredItemAmount(ExcavationStone, 500)
    .setRequiredItemAmount(WhiteGem, 150)
    .setRequiredItemAmount(Gold, 3)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Power", 2))

    .trait(Damager)
    .setDamage(30)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();