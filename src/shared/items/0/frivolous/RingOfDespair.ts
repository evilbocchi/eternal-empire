import Difficulty from "@antivivi/jjt-difficulties";
import { findBaseParts } from "@antivivi/vrldk";
import { Workspace } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";

export = new Item(script.Name)
    .setName("Ring Of Despair")
    .setDescription(
        "Is it still fate? Pass droplets through the correct ring for... why even bother. You're not getting through THAT.",
    )
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
            VirtualCollision.onDropletTouched(model, part, (dropletModel) => {
                if (debounce === true) return;
                debounce = true;
                task.delay(1, () => (debounce = false));
                const explosion = new Instance("Explosion");
                explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                explosion.BlastRadius = 50;
                explosion.BlastPressure = 2500000;
                explosion.DestroyJointRadiusPercent = 0;
                explosion.Position = dropletModel.Position;
                playSound("Explosion.mp3", dropletModel);
                explosion.Parent = Workspace;
            });
        }
    });
