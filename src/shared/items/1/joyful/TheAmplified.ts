import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";
import TheAmplifier from "shared/items/0/blessing/TheAmplifier";

export = new Item(script.Name)
    .setName("The Amplified")
    .setDescription(`Recover all your progress back to The Amplifier, and now obtain a boost as if you had 4 of them.
%mul% boost to droplets.`
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 30), 1)
    .setRequiredItemAmount(TheAmplifier, 1)
    .setCreator("butterman_toast")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(Upgrader)
    .setMul(TheAmplifier.trait(Upgrader).mul!.pow(4))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();