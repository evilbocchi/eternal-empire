import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ReinforcedScythe from "shared/items/tools/ReinforcedScythe";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Crystal Scythe")
    .setDescription("Harvests crops at a normal rate. Used by professional farmers who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier3)
    .setPrice(new CurrencyBundle().set("Power", 100000), 1)
    .setRequiredItemAmount(Crystal, 4)
    .setRequiredItemAmount(MagicalWood, 5)
    .setRequiredItemAmount(ReinforcedScythe, 1)
    .setLevelReq(8)
    .setImage(118510633463495)

    .trait(HarvestingTool)
    .setToolType("Scythe")
    .setSpeed(20)
    .setDamage(10)

    .exit();