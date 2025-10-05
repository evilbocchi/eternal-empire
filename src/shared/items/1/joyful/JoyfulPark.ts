import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Joyful Park")
    .setDescription(
        "Droplets that pass through this enchanting park gain a massive %pow%, %mul% boost. It's time to relax.",
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Upgrader)
    .setPow(new CurrencyBundle().set("Funds", 1.02))
    .setMul(
        new CurrencyBundle()
            .set("Funds", 2)
            .set("Power", 3)
            .set("Skill", 4)
            .set("Bitcoin", 6)
            .set("Purifier Clicks", 20),
    )

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
