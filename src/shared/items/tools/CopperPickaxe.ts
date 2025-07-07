import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import HarvestingTool from "shared/item/traits/HarvestingTool";

export = new Item(script.Name)
    .setName("Copper Pickaxe")
    .setDescription("Harvests minerals at a very slow rate. Sufficient for the average miner.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(getAsset("assets/CopperPickaxe.png"))

    .trait(HarvestingTool)
    .setToolType("Pickaxe")
    .setSpeed(8)
    .setDamage(1)

    .exit();