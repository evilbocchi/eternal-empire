import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";

export = new Item(script.Name)
    .setName("Sacred Baptism")
    .setDescription("That's right. You need to baptise your droplets to make them stronger. %mul% droplet value.")
    .setDifficulty(Difficulty.Sleepful)
    .setPrice(new CurrencyBundle().set("Funds", 3e27).set("Skill", 10), 1)
    .setRequiredItemAmount(Iron, 10)
    .setRequiredItemAmount(Gold, 1)
    .addPlaceableArea("SlamoVillage")
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 25))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();