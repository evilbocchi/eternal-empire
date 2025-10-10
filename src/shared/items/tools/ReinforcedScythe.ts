import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import Iron from "shared/items/excavation/Iron";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";
import CopperScythe from "shared/items/tools/CopperScythe";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Reinforced Scythe")
    .setDescription("Harvests crops at a slow rate. Used by professional farmers who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(Iron, 2)
    .setRequiredItemAmount(CrystalIngot, 1)
    .setRequiredItemAmount(MagicalWood, 3)
    .setRequiredItemAmount(CopperScythe, 1)
    .setLevelReq(4)
    .setImage(getAsset("assets/ReinforcedScythe.png"))
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Scythe")
    .setSpeed(18)
    .setDamage(2)

    .exit();
