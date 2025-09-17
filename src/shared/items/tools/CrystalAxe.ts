import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ReinforcedAxe from "shared/items/tools/ReinforcedAxe";

export = new Item(script.Name)
    .setName("Crystal Axe")
    .setDescription("Harvests wood at a normal rate. Used by professional woodcutters who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier3)
    .setPrice(new CurrencyBundle().set("Power", 100000), 1)
    .setRequiredItemAmount(Crystal, 6)
    .setRequiredItemAmount(MagicalWood, 4)
    .setRequiredItemAmount(ReinforcedAxe, 1)
    .setLevelReq(8)
    .setImage(getAsset("assets/CrystalAxe.png"))

    .trait(Gear)
    .setType("Axe")
    .setSpeed(20)
    .setDamage(10)

    .exit();
