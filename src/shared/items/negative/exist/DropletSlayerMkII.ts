import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import DropletSlayerMkI from "../negativity/DropletSlayerMkI";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";
import { TweenService } from "@rbxts/services";

export = new Upgrader("DropletSlayerMkII")
.setName("Droplet Slayer Mk. II")
.setDescription("This is getting ridiculous. Literally hire a noob to slay droplets for you, multiplying their value by ($4, 2 W)x every 4 seconds.")
.setDifficulty(Difficulties.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([12.1, 15])), 1)
.setRequiredItemAmount(DropletSlayerMkI, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 3))
.onLoad((model, _utils, item) => {
    const noob = model.WaitForChild("Noob") as Model;
    const humanoid = noob.FindFirstChildOfClass("Humanoid");
    if (humanoid === undefined) {
        return;
    }
    const animator = humanoid.FindFirstChildOfClass("Animator");
    if (animator === undefined) {
        return;
    }
    const animation = loadAnimation(humanoid, 16920778613);
    const laser = model.WaitForChild("Laser") as BasePart;
    const slash = model.WaitForChild("Slash") as BasePart;
    slash.Transparency = 1;
    const sound = laser.WaitForChild("Sound") as Sound;
    const slashOriginalCFrame = slash.CFrame;
    const oCFrame = laser.CFrame;
    const bye = oCFrame.sub(new Vector3(0, 10000, 0));
    laser.CFrame = bye;
    item.repeat(model, () => {
        slash.Transparency = 0.011;
        slash.CFrame = slashOriginalCFrame;
        TweenService.Create(slash, new TweenInfo(0.3), {CFrame: slashOriginalCFrame.mul(CFrame.Angles(0, math.rad(180), 0)), Transparency: 1}).Play();
        animation?.Play();
        sound.Play();
        laser.CFrame = oCFrame;
        task.delay(0.5, () => {
            laser.CFrame = bye;
        });
    }, 4);
});