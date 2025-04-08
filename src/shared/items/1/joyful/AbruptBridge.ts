import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";


export = new Item(script.Name)
    .setName("Abrupt Bridge")
    .setDescription("A bridge in the sky and a river, cutting off like nothing was ever there. ")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 20e9), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SkyPavilion")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();