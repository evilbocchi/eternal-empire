import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Copper Scythe")
    .setDescription("Harvests crops at a very slow rate. Sufficient for the average farmer.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(110401457158030)

    .trait(HarvestingTool)
    .setToolType("Scythe")
    .setSpeed(8)
    .setDamage(1)

    .exit();