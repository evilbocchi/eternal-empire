import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Childhood Slide")
    .setDescription("After all these years, you still remember the joy of sliding down a slide. This slide is no different, except it boosts your Skill gain by %mul%.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 20e9), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2))

    .trait(Conveyor)
    .setSpeed(7)

    .exit();