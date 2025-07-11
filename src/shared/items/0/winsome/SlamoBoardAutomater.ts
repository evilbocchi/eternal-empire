import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";
import UpgradeBoardI from "shared/items/negative/trueease/UpgradeBoardI";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Generator(script.Name)
    .setName("Slamo Board Automater")
    .setDescription("Feel bad? Just remember the numerous war crimes this Slamo has committed in its life. It'll automate Upgrade Board I for you as part of its community service.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new Price().setCost("Power", 400e12).setCost("Skill", 4), 1)

    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")
    .setPassiveGain(new Price().setCost("Dark Matter", 0.1))
    .onLoad((model, item) => {
        item.repeat(model, () => {
            for (const upgrade of UpgradeBoardI.upgrades) {
                GameUtils.buyUpgrade(upgrade.id, undefined, undefined, true);
            }
        }, 0.1);
    });