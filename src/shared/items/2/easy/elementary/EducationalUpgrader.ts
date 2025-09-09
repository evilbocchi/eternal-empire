import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("EducationalUpgrader")
    .setDescription("Give your droplets an education that provides a MASSIVE boost by %val% to your droplets!  ")
    .setDifficulty(Difficulty.Educational)
    .setPrice(new CurrencyBundle().set("Funds", 15e52).set("Power", 1e33), 1)
    .addPlaceableArea("BarrenIslands", "SkyPavillion")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().setMul("Funds", 15).setMul("Power", 8.75).setMul("Bitcoin",  4.5).setMul("Skill", 3.14))

    .trait(Conveyor)
    .setSpeed(1)

    .exit();
