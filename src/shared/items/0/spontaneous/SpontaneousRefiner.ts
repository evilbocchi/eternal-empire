import Difficulty from "@antivivi/jjt-difficulties";
import { findBaseParts } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import SmilingKiller from "shared/items/0/vintage/SmilingKiller";
import LaserTurbine from "shared/items/0/walkthrough/LaserTurbine";
import ElevatedUpgrader from "shared/items/negative/felixthea/ElevatedUpgrader";
import FrozenGate from "shared/items/negative/instantwin/FrozenGate";
import DirectDropletWasher from "shared/items/negative/negativity/DirectDropletWasher";
import BasicHealthPack from "shared/items/negative/restful/BasicHealthPack";
import ReversedUpgrader from "shared/items/negative/reversedperipherality/ReversedUpgrader";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";
import BasicRefiner from "shared/items/negative/tlg/BasicRefiner";
import DropletElectronInfuser from "shared/items/negative/trueease/DropletElectronInfuser";

const combining = [
    TheFirstUpgrader,
    BasicRefiner,
    DirectDropletWasher,
    DropletElectronInfuser,
    ElevatedUpgrader,
    ReversedUpgrader,
    BasicHealthPack,
    FrozenGate,
    SmilingKiller,
    LaserTurbine,
];

let totalAdd = new CurrencyBundle();
let totalMul = CurrencyBundle.ones();
let totalDamage = 0;
for (const item of combining) {
    if (item.MODEL === undefined) continue;
    const laserCount = findBaseParts(item.MODEL, "Laser").size();
    const upgrader = item.findTrait("Upgrader");
    if (upgrader !== undefined) {
        if (upgrader.add !== undefined) {
            totalAdd = totalAdd.add(upgrader.add.mul(laserCount));
        }
        if (upgrader.mul !== undefined) {
            totalMul = totalMul.mul(upgrader.mul.pow(laserCount));
        }
    }
    const damager = item.findTrait("Damager");
    if (damager !== undefined) {
        totalDamage += damager.damage * laserCount;
    }
}
totalAdd = totalAdd.add(new CurrencyBundle().set("Funds", 200000).set("Power", 200000).set("Bitcoin", 16));
totalMul = totalMul.mul(new CurrencyBundle().set("Funds", 3).set("Power", 3));
for (const [currency, amount] of totalMul.amountPerCurrency) {
    if (amount.equals(1)) {
        totalMul.amountPerCurrency.delete(currency);
    }
}
totalDamage -= 10;

const SpontaneousRefiner = new Item(script.Name)
    .setName("Spontaneous Refiner")
    .setDescription(
        `Suddenly, profit.

%add%, %mul%, %hp_add%.`,
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 45e42).set("Power", 10e27), 1)

    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")

    .trait(Upgrader)
    .setAdd(totalAdd)
    .setMul(totalMul)

    .trait(Damager)
    .setDamage(totalDamage)

    .exit();

for (const item of combining) {
    SpontaneousRefiner.setRequiredItemAmount(item, item.pricePerIteration.size());
}

export = SpontaneousRefiner;
