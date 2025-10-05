import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Inclined Refiner")
    .setDescription("Inclines up then down. %add% to droplets passing through this upgrader in Slamo Village.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Funds", 4.1e24).set("Skill", 1), 1)
    .setCreator("MHPlayer12")
    .addPlaceableArea("SlamoVillage")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 1000))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
