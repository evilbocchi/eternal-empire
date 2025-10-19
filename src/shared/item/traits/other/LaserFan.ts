import { weldModel } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";
import CustomProximityPrompt from "shared/world/CustomProximityPrompt";

declare global {
    interface PlacedItem {
        direction?: boolean;
    }
}

const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);

export default class LaserFan extends ItemTrait {
    static readonly laserFanChanged = perItemPacket(
        packet<(placementId: string, cframe: CFrame) => void>({ isUnreliable: true }),
        { slowStart: true },
    );

    static load(model: Model, laserFan: LaserFan) {
        const motor = model.WaitForChild("Motor") as Model;
        const primaryPart = weldModel(motor);
        const original = primaryPart.CFrame;
        let v = 0;
        const ItemService = Server.Item;
        let direction = ItemService.getPlacedItem(model.Name)?.direction === true;
        laserFan.item.repeat(
            model,
            () => {
                v += (direction ? 1 : -1) * laserFan.speed;
                const newCFrame = original.mul(CFrame.Angles(math.rad(v), 0, 0));
                LaserFan.laserFanChanged.toAllClients(model, newCFrame);
                TweenService.Create(primaryPart, tweenInfo, {
                    CFrame: newCFrame,
                }).Play();
            },
            0.1,
        );

        const proximityPrompt = primaryPart.FindFirstChild("ProximityPrompt") as ProximityPrompt | undefined;
        if (proximityPrompt !== undefined) {
            const cleanup = CustomProximityPrompt.onTrigger(proximityPrompt, () => {
                direction = !direction;
                const pi = ItemService.getPlacedItem(model.Name);
                if (pi === undefined) {
                    return;
                }
                pi.direction = direction;
            });
            model.Destroying.Once(cleanup);
        }
    }

    static clientLoad(model: Model, laserFan: LaserFan) {
        const motor = model.WaitForChild("Motor") as Model;
        const primaryPart = weldModel(motor);
        LaserFan.laserFanChanged.fromServer(model, (cframe) => {
            TweenService.Create(primaryPart, tweenInfo, { CFrame: cframe }).Play();
        });
    }

    speed = 3;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => LaserFan.load(model, this));
        item.onClientLoad((model) => LaserFan.clientLoad(model, this));
    }

    setSpeed(speed: number) {
        this.speed = speed;
        return this;
    }
}
