import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Copper Axe")
    .setDescription("Harvests wood at a very slow rate. Sufficient for the average woodcutter.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(120559796879009)

    .trait(HarvestingTool)
    .setToolType("Axe")
    .setSpeed(8)
    .setDamage(1)

    .exit();