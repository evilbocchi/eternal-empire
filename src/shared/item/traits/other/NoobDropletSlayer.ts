import { getAllInstanceInfo, loadAnimation } from "@antivivi/vrldk";
import { TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import BaseDropletSlayer from "shared/item/traits/other/BaseDropletSlayer";

export default class NoobDropletSlayer extends BaseDropletSlayer {
    static load(model: Model, slayer: NoobDropletSlayer) {
        const modelInfo = getAllInstanceInfo(model);

        let i = 0;
        super.baseLoad(model, slayer, () => {
            let hasRadioNoob = false;
            if (modelInfo.Boosts !== undefined) {
                for (const [, boost] of modelInfo.Boosts) {
                    if (boost.chargedBy?.item.id === "RadioNoob") {
                        hasRadioNoob = true;
                        break;
                    }
                }
            }
            if (hasRadioNoob) {
                i++;
                i %= 2;
            }
            return tostring(i);
        });
    }

    static clientLoad(model: Model) {
        const noob = model.WaitForChild("Noob") as Model;
        const animationController = noob.WaitForChild("AnimationController") as AnimationController;
        const animTrack = loadAnimation(animationController, 16920778613);

        const slash = model.WaitForChild("Slash") as BasePart;
        slash.Transparency = 1;
        const slashOriginalCFrame = slash.CFrame;

        BaseDropletSlayer.activatePacket.fromServer(model, () => {
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
