import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import Crystal from "shared/items/excavation/Crystal";
import Grass from "shared/items/negative/tfd/Grass";
import StaleWood from "shared/items/negative/tfd/StaleWood";
import ToolShop from "shared/items/tools/ToolShop";

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
    .soldAt(ToolShop)

    .trait(Gear)
    .exit();
