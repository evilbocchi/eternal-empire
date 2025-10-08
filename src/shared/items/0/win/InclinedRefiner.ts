import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Inclined Refiner")
    .setDescription("Inclines up then down. %add% to droplets passing through this upgrader in Slamo Village.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Funds", 4.1e24).set("Skill", 1), 1)
    .setCreator("MHPlayer12")
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 1000))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
