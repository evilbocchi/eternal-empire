import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import Crystal from "shared/items/excavation/Crystal";
import EnchantedGrass from "shared/items/negative/tlg/EnchantedGrass";
import Grass from "shared/items/negative/tfd/Grass";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";
import StaleWood from "shared/items/negative/tfd/StaleWood";

export = new Item(script.Name)
    .setName("Portable Beacon")
    .setDescription("Quickly teleport to areas you have previously visited.")
    .setDifficulty(TierDifficulty.Tier3)
    .setPrice(new CurrencyBundle().set("Power", 100e12), 1)
    .setRequiredItemAmount(StaleWood, 50)
    .setRequiredItemAmount(Grass, 50)
    .setRequiredItemAmount(Crystal, 1)
    .setLevelReq(5)
    .setImage(getAsset("assets/PortableBeacon.png"))
    .setLayoutOrder(6)

    .trait(Gear)
    .exit();
