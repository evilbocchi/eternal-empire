import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Copper Scythe")
    .setDescription("Harvests crops at a very slow rate. Sufficient for the average farmer.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(getAsset("assets/CopperScythe.png"))
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Scythe")
    .setSpeed(8)
    .setDamage(1)

    .exit();
