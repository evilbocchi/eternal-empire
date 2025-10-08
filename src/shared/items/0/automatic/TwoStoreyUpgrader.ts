import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import OmniUpgrader from "shared/item/traits/upgrader/OmniUpgrader";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Two-Storey Upgrader")
    .setDescription(
        "This upgrader has two layers; how are you going to use them both? Each laser boosts their respective currency by x1.8.",
    )
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Skill", 7000000).set("Dark Matter", 20e27), 1)
    .setCreator("fartmcfly2")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)

    .trait(OmniUpgrader)
    .setMuls(
        new Map([
            ["GreenLaser", new CurrencyBundle().set("Funds", 1.8)],
            ["YellowLaser", new CurrencyBundle().set("Power", 1.8)],
        ]),
    )
    .setSkys(new Map([["YellowLaser", true]]))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
