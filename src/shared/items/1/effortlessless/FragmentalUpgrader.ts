import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Fragmental Upgrader")
    .setDescription("Forged from the fragments of all previous progress. Multiplies droplet value by an absurd %mul%.")
    .setDifficulty(Difficulty.Effortlessless)
    .setPrice(new CurrencyBundle().set("Skill", 1e36).set("Bitcoin", 1e54), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("SlamoVillage")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 10))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
