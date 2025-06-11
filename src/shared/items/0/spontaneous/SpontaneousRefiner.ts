import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import BasicRefiner from "shared/items/negative/tlg/BasicRefiner";
import DirectDropletWasher from "shared/items/negative/negativity/DirectDropletWasher";
import DropletElectronInfuser from "shared/items/negative/trueease/DropletElectronInfuser";
import ElevatedUpgrader from "shared/items/negative/felixthea/ElevatedUpgrader";
import ReversedUpgrader from "shared/items/negative/reversedperipherality/ReversedUpgrader";


export = new Item(script.Name)
    .setName("Spontaneous Refiner")
    .setDescription("Suddenly, profit. %add%, %mul%.")
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 55e42), 1)
    .setRequiredItemAmount(BasicRefiner, 4)
    .setRequiredItemAmount(DirectDropletWasher, 4)
    .setRequiredItemAmount(DropletElectronInfuser, 1)
    .setRequiredItemAmount(ElevatedUpgrader, 1)
    .setRequiredItemAmount(ReversedUpgrader, 1)

    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 250000))
    .setMul(new CurrencyBundle().set("Funds", 1.8).set("Power", 1.8))

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
