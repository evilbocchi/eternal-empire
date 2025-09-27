import { getAllInstanceInfo, loadAnimation } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { TweenService } from "@rbxts/services";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import ItemTrait from "shared/item/traits/ItemTrait";
import perItemPacket from "shared/item/utils/perItemPacket";

export default class NoobDropletSlayer extends ItemTrait {
    static readonly activatePacket = perItemPacket(packet<(placementId: string) => void>());

    static load(model: Model, slayer: NoobDropletSlayer) {
        const item = slayer.item;
        const instanceInfo = getAllInstanceInfo(model);
        const baseLaser = model.WaitForChild("Laser") as BasePart;
        const laserInfo = getAllInstanceInfo(baseLaser);
        laserInfo.Enabled = false;
        let i = 0;
        let hasRadioNoob = false;
        const ref = item.repeat(
            model,
            () => {
                this.activatePacket.toAllClients(model);
                laserInfo.Enabled = true;
                task.delay(0.5, () => (laserInfo.Enabled = false));
            },
            slayer.cooldown,
        );

        instanceInfo.BoostAdded!.add((boost) => {
            if (boost.charger?.item.id !== "RadioNoob") return;
            hasRadioNoob = true;
            ref.delta = slayer.cooldown / (hasRadioNoob ? 2 : 1);
        });

        instanceInfo.BoostRemoved!.add((boost) => {
            if (boost.charger?.item.id !== "RadioNoob") return;
            hasRadioNoob = false;
            ref.delta = slayer.cooldown / (hasRadioNoob ? 2 : 1);
        });
    }

    static clientLoad(model: Model) {
        const noob = model.WaitForChild("Noob") as Model;
        const animationController = noob.FindFirstChildOfClass("AnimationController");
        if (animationController === undefined) return;
        const animTrack = loadAnimation(animationController, 16920778613);

        const laser = model.WaitForChild("Laser") as BasePart;
        const slash = model.WaitForChild("Slash") as BasePart;
        slash.Transparency = 1;
        const sound = laser.WaitForChild("Sound") as Sound;
        const slashOriginalCFrame = slash.CFrame;

        this.activatePacket.fromServer(model, () => {
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
