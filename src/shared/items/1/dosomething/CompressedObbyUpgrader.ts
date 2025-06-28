import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";

export = new Item(script.Name)
    .setName("Compressed Obby Upgrader")
    .setDescription("A conveyor with a built-in obby that has some pretty cool upgrades if you complete it!")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 3e54), 1)
    .addPlaceableArea("SkyPavilion")
    .setCreator("sanjay2133")

    .trait(Conveyor)
    .setSpeed(5)

    .exit();