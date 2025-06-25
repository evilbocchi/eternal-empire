import Difficulty from "@antivivi/jjt-difficulties";
import { getSound } from "shared/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import { getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import { findBaseParts, playSoundAtPart } from "@antivivi/vrldk";

export = new Item(script.Name)
    .setName("Ring Of Despair")
    .setDescription("Is it still fate? Pass droplets through the correct ring for... why even bother. You're not getting through THAT.")
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Funds", 4.44e39).set("Bitcoin", 2e9), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.15))
    .exit()

    .onLoad((model) => {
        for (const part of findBaseParts(model, "SadLaser")) {
            part.CanTouch = true;
            let debounce = false;
            const instanceInfo = getAllInstanceInfo(part);
            instanceInfo.DropletTouched = (otherPart: BasePart) => {
                if (debounce === true)
                    return;
                if (getInstanceInfo(otherPart, "DropletId") !== undefined) {
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
            };
        }
    });