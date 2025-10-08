import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Glass from "shared/items/0/millisecondless/Glass";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";

export = new Item(script.Name)
    .setName("Sacred Baptism")
    .setDescription("That's right. You need to baptise your droplets to make them stronger. %add% droplet value.")
    .setDifficulty(Difficulty.Sleepful)
    .setPrice(new CurrencyBundle().set("Funds", 3e27).set("Skill", 10), 1)
    .setRequiredItemAmount(Glass, 1)
    .setRequiredItemAmount(Iron, 10)
    .setRequiredItemAmount(Gold, 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 250000))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
