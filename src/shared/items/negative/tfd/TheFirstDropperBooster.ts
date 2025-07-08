import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Charger from "shared/item/traits/Charger";
import UniqueItem from "shared/item/traits/UniqueItem";

export = new Item(script.Name)
    .setName("The First Dropper Booster")
    .setDescription("A mystical enhancer that amplifies the performance of The First Dropper. This unique item boosts drop rate by %dropRateMultiplier%x and droplet value by %valueMultiplier%x within a %radius% stud radius. Each instance has randomly generated potency.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 500), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("System")

    .trait(UniqueItem)
    .addPot("dropRateMultiplier", 1.1, 3.0) // 1.1x to 3.0x drop rate boost
    .addPot("valueMultiplier", 1.05, 2.5)   // 1.05x to 2.5x value boost
    .addPot("radius", 8, 16, true)          // 8 to 16 stud radius (integer)

    .trait(Charger)
    .setRadius(12) // Default radius, will be overridden by unique pot
    .setMul(new CurrencyBundle().set("Funds", 1.5)) // Default multiplier, will be enhanced by pots

    .exit();