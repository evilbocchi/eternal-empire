import { getAllInstanceInfo, weldModel } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { RunService, TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import perItemPacket from "shared/item/utils/perItemPacket";
import CustomProximityPrompt from "shared/world/CustomProximityPrompt";

export default class HandCrank extends ItemTrait {
    static readonly crankedPacket = perItemPacket(packet<(placementId: string) => void>());
    callback?: (timeSinceCrank: number, model: Model, modelInfo: InstanceInfo) => void;

    static load(model: Model, handCrank: HandCrank) {
        const modelInfo = getAllInstanceInfo(model);

        let t = 0;
        handCrank.item.repeat(model, () => handCrank.callback?.(os.clock() - t, model, modelInfo), 0.1);

        const crank = model.WaitForChild("Crank") as Model;
        const crankPrimaryPart = crank.PrimaryPart;
        if (crankPrimaryPart === undefined) {
            warn(`HandCrank item ${model.Name} is missing a PrimaryPart on its Crank model.`);
            return;
        }

        const onCrank = (player?: Player) => {
            if (isPlacedItemUnusable(modelInfo) || os.clock() - t < 1) return;

            const character = getPlayerCharacter(player);
            if (character === undefined) return;

            const distance = character.GetPivot().Position.sub(model.GetPivot().Position).Magnitude;
            if (distance > 15) return;

            t = os.clock();
            HandCrank.crankedPacket.toAllClients(model);
        };

        const proximityPrompt = crankPrimaryPart.FindFirstChildOfClass("ProximityPrompt");
        if (proximityPrompt !== undefined) {
            const cleanup = CustomProximityPrompt.onTrigger(proximityPrompt, onCrank);
            model.Destroying.Once(cleanup);
        }
    }

    static clientLoad(model: Model, _handCrank: HandCrank) {
        const crank = model.WaitForChild("Crank") as Model;
        const crankPrimaryPart = weldModel(crank);
        const crankPrimaryPartOriginal = crankPrimaryPart.CFrame;

        HandCrank.crankedPacket.fromServer(model, () => {
            const update = (rotation: number) => {
                return (crankPrimaryPart.CFrame = crankPrimaryPartOriginal.mul(
                    CFrame.Angles(0, 0, math.rad(rotation)),
                ));
            };
            playSound("HandCrank.mp3", crankPrimaryPart);
            let t = 0;
            const connection = RunService.Heartbeat.Connect((dt) => {
                t += dt;
                const rotation = TweenService.GetValue(t, Enum.EasingStyle.Quad, Enum.EasingDirection.Out) * 360;
                update(rotation);
                if (rotation >= 360) {
                    update(0);
                    connection.Disconnect();
                }
            });
        });
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => HandCrank.load(model, this));
        item.onClientLoad((model) => HandCrank.clientLoad(model, this));
    }

    setCallback(callback: (timeSinceCrank: number, model: Model, modelInfo: InstanceInfo) => void) {
        this.callback = callback;
        return this;
    }
}
