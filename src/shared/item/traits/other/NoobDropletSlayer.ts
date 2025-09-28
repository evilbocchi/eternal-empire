import { getAllInstanceInfo, loadAnimation } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import BaseDropletSlayer from "shared/item/traits/other/BaseDropletSlayer";
import perItemPacket from "shared/item/utils/perItemPacket";

export default class NoobDropletSlayer extends BaseDropletSlayer {
    static readonly activatePacket = perItemPacket(packet<(placementId: string) => void>());

    static load(model: Model, slayer: NoobDropletSlayer) {
        let i = 0;
        const { ref } = super.baseLoad(model, slayer, () => {
            if (hasRadioNoob) {
                i++;
                i %= 2;
            }
            return tostring(i);
        });

        let hasRadioNoob = false;

        const modelInfo = getAllInstanceInfo(model);
        modelInfo.Chargeable = true;

        modelInfo.BoostAdded!.add((boost) => {
            if (boost.chargedBy?.item.id !== "RadioNoob") return;
            hasRadioNoob = true;
            ref.delta = slayer.cooldown / (hasRadioNoob ? 2 : 1);
        });

        modelInfo.BoostRemoved!.add((boost) => {
            if (boost.chargedBy?.item.id !== "RadioNoob") return;
            hasRadioNoob = false;
            ref.delta = slayer.cooldown / (hasRadioNoob ? 2 : 1);
        });
    }

    static clientLoad(model: Model) {
        const noob = model.WaitForChild("Noob") as Model;
        const animationController = noob.FindFirstChildOfClass("AnimationController");
        if (animationController === undefined) return;
        const animTrack = loadAnimation(animationController, 16920778613);

        const slash = model.WaitForChild("Slash") as BasePart;
        slash.Transparency = 1;
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
            playSound("SwordSwing.mp3", noob);
        });
    }

    constructor(item: Item) {
        super(item);
        item.trait(Generator).addToWhitelist("RadioNoob");

        item.onLoad((model) => NoobDropletSlayer.load(model, this));
        item.onClientLoad((model) => NoobDropletSlayer.clientLoad(model));
    }
}
