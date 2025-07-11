import { TweenService } from "@rbxts/services";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader("DropletSlayerMkI")
.setName("Droplet Slayer Mk. I")
.setDescription("Fires a short beam that multiplies a droplet's value by %mul%x every 4 seconds.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 6600), 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 3))
.onLoad((model, _utils, item) => {
    const laser = model.WaitForChild("Laser") as BasePart;
    const sound = laser.WaitForChild("Sound") as Sound;
    laser.Transparency = 1;
    item.repeat(model, () => {
        sound.Play();
        laser.SetAttribute("Enabled", true);
        laser.Transparency = 0.3;
        TweenService.Create(laser, new TweenInfo(0.5), {Transparency: 1}).Play();
        task.delay(0.5, () => {
            laser.SetAttribute("Enabled", false);
        });
    }, 4);
});