import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Mechanical Enhancer")
    .setDescription(
        "Built by a Chief Slamo with the assistance of a grey-and-yellow traveller; The result is a highly unstable machine of.. varying usefulness. %pow% gain to droplets, your very first exponential upgrader. When using this, you will need to sacrifice %drain%, however.",
    )
    .setDifficulty(Difficulty.Ifinitude)
    .setPrice(new CurrencyBundle().set("Funds", 5e33).set("Skill", 50), 1)
    .setRequiredItemAmount(AdvancedBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .setDrain(new CurrencyBundle().set("Skill", 0.5))

    .trait(Upgrader)
    .setPow(new CurrencyBundle().set("Funds", 1.02))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
