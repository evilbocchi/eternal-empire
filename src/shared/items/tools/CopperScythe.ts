import Gear from "shared/item/traits/Gear";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";
import { getAsset } from "shared/asset/AssetMap";

export = new Item(script.Name)
    .setName("Copper Scythe")
    .setDescription("Harvests crops at a very slow rate. Sufficient for the average farmer.")
    .setDifficulty(TierDifficulty.Tier1)
    .setPrice(new CurrencyBundle().set("Funds", 1e9), 1)
    .setLevelReq(1)
    .setImage(getAsset("assets/CopperScythe.png"))

    .trait(Gear)
    .setType("Scythe")
    .setSpeed(8)
    .setDamage(1)

    .exit();
