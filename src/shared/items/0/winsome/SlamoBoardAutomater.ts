import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import UpgradeBoardI from "shared/items/negative/trueease/UpgradeBoardI";
import { GameUtils } from "shared/item/ItemUtils";

export = new Item(script.Name)
    .setName("Slamo Board Automater")
    .setDescription("Feel bad? Just remember the numerous war crimes this Slamo has committed in its life. It'll automate Upgrade Board I for you as part of its community service.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Power", 400e12).set("Skill", 4), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 0.1))
    .exit()

    .onLoad((model, item) => {
        const upgrades = UpgradeBoardI.trait(UpgradeBoard).upgrades;

        item.repeat(model, () => {
            for (const upgrade of upgrades) {
                GameUtils.buyUpgrade(upgrade.id, undefined, undefined, true);
            }
        }, 0.1);
    });