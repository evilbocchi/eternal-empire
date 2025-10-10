import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import Iron from "shared/items/excavation/Iron";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import CrystalPickaxe from "shared/items/tools/CrystalPickaxe";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Iron Pickaxe")
    .setDescription("Harvests minerals at a quick rate. A tool for serious miners.")
    .setDifficulty(TierDifficulty.Tier4)
    .setPrice(new CurrencyBundle().set("Skill", 10000), 1)
    .setRequiredItemAmount(Iron, 40)
    .setRequiredItemAmount(MagicalWood, 10)
    .setRequiredItemAmount(CrystalPickaxe, 1)
    .setLevelReq(12)
    .setImage(getAsset("assets/IronPickaxe.png"))
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Pickaxe")
    .setSpeed(18)
    .setDamage(35)

    .exit();
