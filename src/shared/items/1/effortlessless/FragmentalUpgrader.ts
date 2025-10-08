import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "../Class1Shop";

export = new Item(script.Name)
    .setName("Fragmental Upgrader")
    .setDescription("Forged from the fragments of all previous progress. Multiplies droplet value by an absurd %mul%.")
    .setDifficulty(Difficulty.Effortlessless)
    .setPrice(new CurrencyBundle().set("Skill", 1e36).set("Bitcoin", 1e54), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class1Shop)
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 10))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
