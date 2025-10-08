import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Skill Easer")
    .setDescription("%add% value to droplets. You need to ease up a little. Everything will get faster...")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Skill", 16), 1)
    .setCreator("goog_als")
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Skill", 0.02))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
