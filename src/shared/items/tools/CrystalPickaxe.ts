import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";
import ReinforcedPickaxe from "shared/items/tools/ReinforcedPickaxe";

export = new Item(script.Name)
    .setName("Crystal Pickaxe")
    .setDescription("Harvests minerals at a normal rate. Used by professional miners who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier3)
    .setPrice(new CurrencyBundle().set("Power", 100000), 1)
    .setRequiredItemAmount(CrystalIngot, 6)
    .setRequiredItemAmount(MagicalWood, 4)
    .setRequiredItemAmount(ReinforcedPickaxe, 1)
    .setLevelReq(8)
    .setImage(getAsset("assets/CrystalPickaxe.png"))

    .trait(Gear)
    .setType("Pickaxe")
    .setSpeed(20)
    .setDamage(10)

    .exit();
