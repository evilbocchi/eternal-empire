import Difficulty from "@antivivi/jjt-difficulties";
import { findBaseParts, getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import { CollectionService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/api/APIExpose";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Ring Of Fortune")
    .setDescription(
        "It's fate! You were destined to boost Funds gain, with that multiplier increasing by Skill. Just pass droplets through the correct ring. Or else...",
    )
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Funds", 20e36), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().pow(0.1))
    .setFormulaX("skill")

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v)),
        () => Server.Currency.get("Skill"),
    )
    .exit()

    .onLoad((model) => {
        for (const part of findBaseParts(model, "SadLaser")) {
            CollectionService.AddTag(part, "Laser");
            let debounce = false;
            const instanceInfo = getAllInstanceInfo(part);
            instanceInfo.DropletTouched = (otherPart: BasePart) => {
                if (debounce === true) return;
                if (getInstanceInfo(otherPart, "DropletId") !== undefined) {
                    debounce = true;
                    task.delay(1, () => (debounce = false));
                    const explosion = new Instance("Explosion");
                    explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                    explosion.BlastRadius = 50;
                    explosion.BlastPressure = 2500000;
                    explosion.DestroyJointRadiusPercent = 0;
                    explosion.Position = part.Position;
                    playSound("Explosion.mp3", part);
                    explosion.Parent = part;
                }
            };
        }
    });
