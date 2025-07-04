import { TweenService } from "@rbxts/services";
import Item from "shared/item/Item";
import { ServerAPI } from "shared/item/ItemUtils";
import { weldModel } from "@antivivi/vrldk";

declare global {
    interface PlacedItem {
        direction?: boolean;
    }
}

export namespace LaserFan {
    export function load(model: Model, item: Item, speed?: number) {
        const motor = model.WaitForChild("Motor") as Model;
        const bp = weldModel(motor);
        const o = bp.CFrame;
        let v = 0;
        const ItemsService = ServerAPI.itemsService;
        let d = ItemsService.getPlacedItem(model.Name)?.direction === true;
        const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);
        item.repeat(model, () => {
            v += (d ? 1 : -1) * (speed ?? 3);
            TweenService.Create(bp, tweenInfo, { CFrame: o.mul(CFrame.Angles(math.rad(v), 0, 0)) }).Play();
        }, 0.1);
        (bp.FindFirstChild("ProximityPrompt") as ProximityPrompt | undefined)?.Triggered.Connect(() => {
            d = !d;
            const pi = ItemsService.getPlacedItem(model.Name);
            if (pi === undefined) {
                return;
            }
            pi.direction = d;
        });
    }
}