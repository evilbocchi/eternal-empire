import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import DropperBooster from "shared/item/traits/boost/DropperBooster";
import Unique from "shared/item/traits/Unique";
import BulkyDropper from "shared/items/negative/tlg/BulkyDropper";

export = new Item(script.Name)
    .setName("Bulky Dropper Booster")
    .setDescription(
        "An enhancer that amplifies the performance of Bulky Droppers, multiplying drop rate by %dropRateMultiplier% times.",
    )
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 500), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Unique)
    .addPot("dropRateMultiplier", 1.1, 1.6)
    .onLoad((_, unique, scaledPots) => {
        unique.trait(DropperBooster).setDropRateMul(scaledPots.get("dropRateMultiplier")!);
    })

    .trait(DropperBooster)
    .setWhitelist((_, item) => item === BulkyDropper)

    .exit();
