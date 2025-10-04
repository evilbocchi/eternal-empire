import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";

export = new Item(script.Name)
    .setName("Anti-Gravity Anti-Clockwise Conveyor")
    .setDescription(
        "A fusion of anti-gravity technology and anti-clockwise engineering. Floats mid-air while turning your droplets counter-clockwise.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1, 3)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
