import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Copper Pickaxe")
    .setDescription("Harvests minerals at a very slow rate. Sufficient for the average miner.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(88369108808255)

    .trait(HarvestingTool)
    .setToolType("Pickaxe")
    .setSpeed(8)
    .setDamage(1)

    .exit();