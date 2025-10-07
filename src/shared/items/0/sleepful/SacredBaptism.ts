import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";
import Glass from "shared/items/0/millisecondless/Glass";

export = new Item(script.Name)
    .setName("Sacred Baptism")
    .setDescription("That's right. You need to baptise your droplets to make them stronger. %add% droplet value.")
    .setDifficulty(Difficulty.Sleepful)
    .setPrice(new CurrencyBundle().set("Funds", 3e27).set("Skill", 10), 1)
    .setRequiredItemAmount(Glass, 1)
    .setRequiredItemAmount(Iron, 10)
    .setRequiredItemAmount(Gold, 1)
    .addPlaceableArea("SlamoVillage")
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 250000))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
