import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Joyful Park")
    .setDescription("Congratulations on making it this far to Class 1! Let's start with some crazy boosts. Droplets that pass through this enchanting park gain a massive %pow%, %mul% boost.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Upgrader)
    .setPow(new CurrencyBundle().set("Funds", 1.02))
    .setMul(new CurrencyBundle().set("Skill", 3).set("Bitcoin", 4).set("Purifier Clicks", 10))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();