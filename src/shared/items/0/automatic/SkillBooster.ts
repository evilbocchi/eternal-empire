import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";


export = new Item(script.Name)
    .setName("Skill Booster")
    .setDescription("A convoluted piece of machinery that has one purpose: to boost droplets by %mul%. We must continue pushing Skill.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 10e39).set("Power", 50e24).set("Skill", 6000000), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 4))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
