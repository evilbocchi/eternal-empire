import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import CopperAxe from "shared/items/tools/CopperAxe";
import ToolShop from "shared/items/tools/ToolShop";

export = new Item(script.Name)
    .setName("Reinforced Axe")
    .setDescription("Harvests wood at a slow rate. Used by professional woodcutters who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(WhiteGem, 3)
    .setRequiredItemAmount(ExcavationStone, 9)
    .setRequiredItemAmount(MagicalWood, 2)
    .setRequiredItemAmount(CopperAxe, 1)
    .setImage(getAsset("assets/ReinforcedAxe.png"))
    .setLevelReq(4)
    .soldAt(ToolShop)

    .trait(Gear)
    .setType("Axe")
    .setSpeed(18)
    .setDamage(2)

    .exit();
