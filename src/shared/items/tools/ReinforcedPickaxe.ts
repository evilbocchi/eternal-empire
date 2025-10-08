import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CopperPickaxe from "shared/items/tools/CopperPickaxe";

export = new Item(script.Name)
    .setName("Reinforced Pickaxe")
    .setDescription("Harvests minerals at a slow rate. Used by professional miners who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(WhiteGem, 3)
    .setRequiredItemAmount(ExcavationStone, 9)
    .setRequiredItemAmount(MagicalWood, 2)
    .setRequiredItemAmount(CopperPickaxe, 1)
    .setLevelReq(4)
    .setImage(getAsset("assets/ReinforcedPickaxe.png"))

    .trait(Gear)
    .setType("Pickaxe")
    .setSpeed(18)
    .setDamage(2)

    .exit();
