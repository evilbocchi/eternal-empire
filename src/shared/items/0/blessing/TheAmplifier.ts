import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import InclinedRefiner from "shared/items/0/win/InclinedRefiner";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("The Amplifier")
    .setDescription("%mul% boost to droplets. This is technically a trade-off for the additive Funds boost the Inclined Refiner gives.")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Skill", 30), 1)
    .setRequiredItemAmount(InclinedRefiner, 1)
    .setCreator("butterman_toast")
    .addPlaceableArea("BarrenIslands")
    .addPlaceableArea("SlamoVillage")
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Bitcoin", 2).set("Power", 1.25))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();