import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import DropperBooster from "shared/item/traits/boost/DropperBooster";
import Unique from "shared/item/traits/Unique";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";

export = new Item(script.Name)
    .setName("The First Dropper Booster")
    .setDescription("An enhancer that amplifies the performance of The First Dropper, multiplying drop rate by %dropRateMultiplier% times.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 500), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Unique)
    .addPot("dropRateMultiplier", 1.1, 3.0)
    .onLoad((model, _unique, scaledPots) => {
        DropperBooster.createModifier(model, (_, item) => item === TheFirstDropper).multi = scaledPots.get("dropRateMultiplier") ?? 1;
    })

    .exit();