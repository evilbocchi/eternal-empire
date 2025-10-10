import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import ReinforcedScythe from "shared/items/tools/ReinforcedScythe";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Crystal Scythe")
    .setDescription("Harvests crops at a normal rate. Used by professional farmers who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier3)
    .setPrice(new CurrencyBundle().set("Power", 100000), 1)
    .setRequiredItemAmount(Crystal, 4)
    .setRequiredItemAmount(MagicalWood, 5)
    .setRequiredItemAmount(ReinforcedScythe, 1)
    .setLevelReq(8)
    .setImage(getAsset("assets/CrystalScythe.png"))
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Scythe")
    .setSpeed(20)
    .setDamage(10)

    .exit();
