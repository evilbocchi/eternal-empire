import Difficulty from "@antivivi/jjt-difficulties";
import { TweenService } from "@rbxts/services";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Upgrader(script.Name)
    .setName("Droplet Slayer Mk. I")
    .setDescription("Fires a short beam that multiplies a droplet's value by %mul% every 4 seconds.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new Price().setCost("Funds", 6600), 1)
    .addPlaceableArea("BarrenIslands")

    .setMul(new Price().setCost("Funds", 3))
    .onLoad((model, item) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        const sound = laser.WaitForChild("Sound") as Sound;
        laser.Transparency = 1;
        const laserInfo = GameUtils.getAllInstanceInfo(laser);
        item.repeat(model, () => {
            sound.Play();
            laserInfo.Enabled = true;
            laser.Transparency = 0.3;
            TweenService.Create(laser, new TweenInfo(0.5), { Transparency: 1 }).Play();
            task.delay(0.5, () => laserInfo.Enabled = false);
        }, 4);
    });