import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import InclinedRefiner from "shared/items/0/win/InclinedRefiner";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("The Amplifier")
    .setDescription(
        "%mul% boost to droplets. This is technically a trade-off for the additive Funds boost the Inclined Refiner gives.",
    )
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Skill", 30), 1)
    .setRequiredItemAmount(InclinedRefiner, 1)
    .setCreator("butterman_toast")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Bitcoin", 2).set("Power", 1.25))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
