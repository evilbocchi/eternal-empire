import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";

export = new Item(script.Name)
    .setName("Full Conversion Ramp")
    .setDescription(
        "Good job on making it to Walk A Slope. You are hereby rewarded with a slope that allows walking in full width.",
    )
    .setDifficulty(Difficulty.WalkASlope)
    .setPrice(new CurrencyBundle().set("Power", 4e27), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("sanjay2133")

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
