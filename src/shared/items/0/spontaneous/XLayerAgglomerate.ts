import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import OmniUpgrader from "shared/item/traits/upgrader/OmniUpgrader";
import TwoStoreyUpgrader from "shared/items/0/automatic/TwoStoreyUpgrader";

export = new Item(script.Name)
    .setName("x-layer Agglomerate")
    .setDescription(
        `Your limit is the sky. This upgrader has multiple layers; how are you going to use them all?
        
Each laser boosts their respective currency by x2.2.`,
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 15e42).set("Skill", 15000000), 1)
    .setRequiredItemAmount(TwoStoreyUpgrader, 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("eeeesdfew")

    .trait(OmniUpgrader)
    .setMuls(
        new Map([
            ["GreenLaser", new CurrencyBundle().set("Funds", 2.2)],
            ["YellowLaser", new CurrencyBundle().set("Power", 2.2)],
            ["BlueLaser", new CurrencyBundle().set("Bitcoin", 2.2)],
        ]),
    )
    .setSkys(new Map([["GreenLaser", true]]))

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
