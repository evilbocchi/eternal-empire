import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Copper Pickaxe")
    .setDescription("Harvests minerals at a very slow rate. Sufficient for the average miner.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(getAsset("assets/CopperPickaxe.png"))
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Pickaxe")
    .setSpeed(8)
    .setDamage(1)

    .exit();
