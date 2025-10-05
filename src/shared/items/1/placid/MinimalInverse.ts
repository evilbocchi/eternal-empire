import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Glass from "shared/items/0/millisecondless/Glass";
import Quartz from "shared/items/excavation/Quartz";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Minimal Inverse")
    .setDescription(
        "Maintain placidity. Add %add% to your droplets on this turnaround, while converting them to the elevated level.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Skill", 1_500_000_000))
    .setCreator("sanjay2133")
    .setRequiredItemAmount(Glass, 10)
    .setRequiredItemAmount(Quartz, 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Skill", 0.5))

    .exit();
