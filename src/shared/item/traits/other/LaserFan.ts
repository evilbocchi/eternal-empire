import { TweenService } from "@rbxts/services";
import Item from "shared/item/Item";
import { Server } from "shared/api/APIExpose";
import { weldModel } from "@antivivi/vrldk";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface PlacedItem {
        direction?: boolean;
    }
}

export default class LaserFan extends ItemTrait {
    static load(model: Model, laserFan: LaserFan) {
        const motor = model.WaitForChild("Motor") as Model;
        const bp = weldModel(motor);
        const o = bp.CFrame;
        let v = 0;
        const ItemService = Server.Item;
        let d = ItemService.getPlacedItem(model.Name)?.direction === true;
        const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);
        laserFan.item.repeat(
            model,
            () => {
                v += (d ? 1 : -1) * laserFan.speed;
                TweenService.Create(bp, tweenInfo, { CFrame: o.mul(CFrame.Angles(math.rad(v), 0, 0)) }).Play();
            },
            0.1,
        );
        (bp.FindFirstChild("ProximityPrompt") as ProximityPrompt | undefined)?.Triggered.Connect(() => {
            d = !d;
            const pi = ItemService.getPlacedItem(model.Name);
            if (pi === undefined) {
                return;
            }
            pi.direction = d;
        });
    }

    speed = 3;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => LaserFan.load(model, this));
    }

    setSpeed(speed: number) {
        this.speed = speed;
        return this;
    }
}
