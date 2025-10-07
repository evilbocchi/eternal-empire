import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Stone from "shared/items/0/millisecondless/Stone";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Jade from "shared/items/excavation/Jade";
import Wool from "shared/items/negative/a/Wool";
import GoldDiggersHaven from "shared/items/negative/skip/GoldDiggersHaven";

export = new Item(script.Name)
    .setName("Educational Upgrader")
    .setDescription(`Give your droplets an education, allowing them to gain %add%.`)
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 1), 1)
    .setRequiredItemAmount(Wool, 222)
    .setRequiredItemAmount(GoldDiggersHaven, 2)
    .setRequiredItemAmount(Stone, 600)
    .setRequiredItemAmount(EnchantedGrass, 120)
    .setRequiredItemAmount(Jade, 1)
    .setCreator("emoronq2k")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Skill", 1))

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
