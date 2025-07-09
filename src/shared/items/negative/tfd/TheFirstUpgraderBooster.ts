import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import UpgraderBooster from "shared/item/traits/boost/UpgraderBooster";
import Unique from "shared/item/traits/Unique";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";

export = new Item(script.Name)
    .setName("The First Upgrader Booster")
    .setDescription("An enhancer that amplifies the performance of The First Upgrader, adding an additional %valueAdd% Funds to the value of droplets passing through it.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 500), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Unique)
    .addPot("valueAdd", 5, 10, true)
    .onLoad((_, unique, scaledPots) => {
        unique.trait(UpgraderBooster).setAdd(new CurrencyBundle().set("Funds", scaledPots.get("valueAdd") ?? 0));
    })

    .trait(UpgraderBooster)
    .setWhitelist((_, item) => item === TheFirstUpgrader)

    .exit();