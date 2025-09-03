import { HttpService, TweenService } from "@rbxts/services";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import ItemTrait from "shared/item/traits/ItemTrait";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import { getAllInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { Streaming } from "@antivivi/vrldk";
import { loadAnimation } from "@antivivi/vrldk";

export default class NoobDropletSlayer extends ItemTrait {
    static load(model: Model, slayer: NoobDropletSlayer) {
        const item = slayer.item;
        const upgrader = item.trait(Upgrader);
        const instanceInfo = getAllInstanceInfo(model);
        const baseLaser = model.WaitForChild("Laser") as BasePart;
        setInstanceInfo(baseLaser, "Enabled", false);
        const lasers = [baseLaser];

        const createLaser = () => {
            const laser = baseLaser.Clone();
            const laserInfo = getAllInstanceInfo(laser);
            laser.Parent = model;
            const laserId = HttpService.GenerateGUID(false);
            laser.Name = laserId;
            laserInfo.LaserId = laserId;
            laserInfo.Enabled = false;
            laser.Touched.Connect(() => {});
            Upgrader.hookLaser(model, upgrader, laser);
            return laser;
        };

        const fireActiveRemote = Streaming.createStreamableRemote(model, true);
        let i = 0;
        const ref = item.repeat(
            model,
            () => {
                fireActiveRemote();
                let cycled = lasers[++i];
                if (cycled === undefined) {
                    i = 0;
                    cycled = lasers[i];
                }
                setInstanceInfo(cycled, "Enabled", true);
                task.delay(0.5, () => setInstanceInfo(cycled, "Enabled", false));
            },
            slayer.cooldown,
        );

        const radioNoobLaser = createLaser();

        instanceInfo.BoostAdded!.add(() => {
            lasers[1] = radioNoobLaser;
            ref.delta = slayer.cooldown / lasers.size();
        });

        instanceInfo.BoostRemoved!.add(() => {
            delete lasers[1];
            ref.delta = slayer.cooldown / lasers.size();
        });
    }

    static clientLoad(model: Model) {
        const noob = model.WaitForChild("Noob") as Model;
        const animationController = noob.FindFirstChildOfClass("AnimationController");
        if (animationController === undefined) return;
        const animTrack = loadAnimation(animationController, 16920778613);

        let laser: BasePart;
        let slash: BasePart;
        let sound: Sound;
        let slashOriginalCFrame: CFrame;

        Streaming.onModelStreamIn(model, () => {
            laser = model.WaitForChild("Laser") as BasePart;
            slash = model.WaitForChild("Slash") as BasePart;
            slash.Transparency = 1;
            sound = laser.WaitForChild("Sound") as Sound;
            slashOriginalCFrame = slash.CFrame;
        });

        Streaming.onStreamableRemote(model, () => {
            if (slash === undefined) return;
            slash.Transparency = 0.011;
            slash.CFrame = slashOriginalCFrame;
            TweenService.Create(slash, new TweenInfo(0.3), {
                CFrame: slashOriginalCFrame.mul(CFrame.Angles(0, math.rad(180), 0)),
                Transparency: 1,
            }).Play();
            animTrack?.Play();
            sound.Play();
        });
    }

    cooldown = 4;

    constructor(item: Item) {
        super(item);
        item.trait(Boostable).addToWhitelist("RadioNoob");

        item.onLoad((model) => NoobDropletSlayer.load(model, this));
        item.onClientLoad((model) => NoobDropletSlayer.clientLoad(model));
    }

    setCooldown(cd: number) {
        this.cooldown = cd;
        return this;
    }
}
