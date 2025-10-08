import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Ablaze from "shared/item/traits/status/Ablaze";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import Quartz from "shared/items/excavation/Quartz";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Flaming Conveyor")
    .setDescription(
        "A conveyor that burns with a fiery intensity. Applies %add% to %ablaze% droplets that pass over it.",
    )
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1000000).set("Dark Matter", 10000))
    .setRequiredItemAmount(WhiteGem, 5)
    .setRequiredItemAmount(Quartz, 1)
    .setDifficulty(Difficulty.Frivolous)
    .setCreator("GIDS214")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Conveyor)
    .setSpeed(4)

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Purifier Clicks", 2).set("Dark Matter", 0.05))
    .setRequirement((dropletInfo) => dropletInfo.Upgrades?.has("Ablaze") ?? false)
    .setSky(true)

    .trait(Ablaze)
    .setActive(false)

    .exit();
