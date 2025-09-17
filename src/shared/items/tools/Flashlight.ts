import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import Crystal from "shared/items/excavation/Crystal";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";

export = new Item(script.Name)
    .setName("Flashlight")
    .setDescription("Portable light source for dark areas.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(MagicalWood, 3)
    .setRequiredItemAmount(EnchantedGrass, 9)
    .setRequiredItemAmount(Crystal, 1)
    .setLevelReq(4)
    .setImage(getAsset("assets/Flashlight.png"))
    .setLayoutOrder(5)

    .trait(Gear)
    .exit();
