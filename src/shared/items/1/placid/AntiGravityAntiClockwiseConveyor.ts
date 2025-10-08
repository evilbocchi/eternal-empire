import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Anti-Gravity Anti-Clockwise Conveyor")
    .setDescription(
        "A fusion of anti-gravity technology and anti-clockwise engineering. Floats mid-air while turning your droplets counter-clockwise.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1, 3)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class1Shop)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
