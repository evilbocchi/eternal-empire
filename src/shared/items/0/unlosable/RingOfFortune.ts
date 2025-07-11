import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { getSound } from "shared/constants";
import Upgrader from "shared/item/Upgrader";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import { findBaseParts, playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

const mul = new Price().setCost("Funds", 0);

export = new Upgrader(script.Name)
    .setName("Ring Of Fortune")
    .setDescription("It's fate! You were destined to boost Funds gain, with that multiplier increasing by Skill. Just pass droplets through the correct ring. Or else...")
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new Price().setCost("Funds", 20e36), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().pow(0.1))
    .setFormulaX("skill")
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Skill"))
    .onLoad((model) => {
        for (const part of findBaseParts(model, "SadLaser")) {
            let debounce = false;
            part.Touched.Connect((otherPart) => {
                if (debounce === true)
                    return;
                if (GameUtils.getInstanceInfo(otherPart, "DropletId") !== undefined) {
                    debounce = true;
                    task.delay(1, () => debounce = false);
                    const explosion = new Instance("Explosion");
                    explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                    explosion.BlastRadius = 50;
                    explosion.BlastPressure = 2500000;
                    explosion.DestroyJointRadiusPercent = 0;
                    explosion.Position = part.Position;
                    playSoundAtPart(part, getSound("Explosion"));
                    explosion.Parent = part;
                }
            });
        }
    });