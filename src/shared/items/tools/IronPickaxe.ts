import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import HarvestingTool from "shared/item/traits/HarvestingTool";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ReinforcedPickaxe from "shared/items/tools/ReinforcedPickaxe";

export = new Item(script.Name)
    .setName("Iron Pickaxe")
    .setDescription("Harvests minerals at a normal rate. Used by professional miners who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier3)
    .setPrice(new CurrencyBundle().set("Power", 100000), 1)
    .setRequiredItemAmount(Crystal, 6)
    .setRequiredItemAmount(MagicalWood, 4)
    .setRequiredItemAmount(ReinforcedPickaxe, 1)
    .setLevelReq(8)
    .setImage(getAsset("assets/IronPickaxe.png"))

    .trait(HarvestingTool)
    .setToolType("Pickaxe")
    .setSpeed(20)
    .setDamage(10)

    .exit();
