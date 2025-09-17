import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";

export = new Item(script.Name)
    .setName("Copper Axe")
    .setDescription("Harvests wood at a very slow rate. Sufficient for the average woodcutter.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(getAsset("assets/CopperAxe.png"))

    .trait(Gear)
    .setType("Axe")
    .setSpeed(8)
    .setDamage(1)

    .exit();
