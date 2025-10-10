import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Copper Axe")
    .setDescription("Harvests wood at a very slow rate. Sufficient for the average woodcutter.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(getAsset("assets/CopperAxe.png"))
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Axe")
    .setSpeed(8)
    .setDamage(1)

    .exit();
