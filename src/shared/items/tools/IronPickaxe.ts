import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import Iron from "shared/items/excavation/Iron";
import CrystalPickaxe from "shared/items/tools/CrystalPickaxe";

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

    .trait(Gear)
    .setType("Pickaxe")
    .setSpeed(18)
    .setDamage(35)

    .exit();
