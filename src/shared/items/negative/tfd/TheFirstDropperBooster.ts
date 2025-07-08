import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Unique from "shared/item/traits/Unique";

export = new Item(script.Name)
    .setName("The First Dropper Booster")
    .setDescription("An enhancer that amplifies the performance of The First Dropper. This unique item boosts drop rate by %dropRateMultiplier% and droplet value by %valueMultiplier%.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 500), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("System")

    .trait(Unique)
    .addPot("dropRateMultiplier", 1.1, 3.0)
    .addPot("valueMultiplier", 1.05, 2.5)

    .exit();