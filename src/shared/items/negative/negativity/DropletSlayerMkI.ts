import { TweenService } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("DropletSlayerMkI")
.setName("Droplet Slayer Mk. I")
.setDescription("What in the... Fires a short beam that multiplies a droplet's value by $3x every 4 seconds.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 6600), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 3))
.onLoad((model, _utils, item) => {
    const laser = model.WaitForChild("Laser") as BasePart;
    const sound = laser.WaitForChild("Sound") as Sound;
    const oCFrame = laser.CFrame;
    const bye = oCFrame.sub(new Vector3(0, 10000, 0));
    laser.CFrame = bye;
    item.repeat(model, () => {
        sound.Play();
        laser.CFrame = oCFrame;
        laser.Transparency = 0.3;
        TweenService.Create(laser, new TweenInfo(0.5), {Transparency: 1}).Play();
        task.delay(0.5, () => {
            laser.CFrame = bye;
        });
    }, 4);
});