import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import ObbyUpgrader from "shared/item/traits/upgrader/ObbyUpgrader";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new Item(script.Name)
    .setName("Compressed Obby Upgrader")
    .setDescription("A conveyor with a built-in obby that has some pretty cool upgrades if you complete it!")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 3e54), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("sanjay2133")

    .trait(Conveyor)
    .setSpeed(5)

    .trait(ObbyUpgrader)
    .setReward(1)
    .setBoost(NamedUpgrades.GreedOfTheObbyI, "Funds", new Formula().mul(0.1).add(1))
    .setBoost(NamedUpgrades.PowerOfTheObbyI, "Power", new Formula().mul(0.1).add(1))
    .setBoost(NamedUpgrades.DecentralityOfTheObbyI, "Bitcoin", new Formula().mul(0.1).add(1))
    .setBoost(NamedUpgrades.MasteryOfTheObbyI, "Skill", new Formula().mul(0.1).add(1))

    .exit();
