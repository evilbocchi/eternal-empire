import { weldModel } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { RunService, TweenService } from "@rbxts/services";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import perItemPacket from "shared/item/utils/perItemPacket";

const crankedPacket = perItemPacket(packet<(placementId: string) => void>());

export default class HandCrank extends ItemTrait {
    callback?: (timeSinceCrank: number, model: Model) => void;

    static load(model: Model, handCrank: HandCrank) {
        let t = 0;
        handCrank.item.repeat(model, () => handCrank.callback?.(os.clock() - t, model), 0.1);
        crankedPacket.fromClient(model, (player) => {
            const character = player.Character;
            if (character === undefined) return;
            const distance = character.GetPivot().Position.sub(model.GetPivot().Position).Magnitude;
            if (distance > 10) return;
            t = os.clock();
            crankedPacket.toAllClients(model);
        });
    }

    static clientLoad(model: Model, _handCrank: HandCrank) {
        const crank = model.WaitForChild("Crank") as Model;
        const crankPrimaryPart = weldModel(crank);
        const crankPrimaryPartOriginal = crankPrimaryPart.CFrame;
        const sound = crank.FindFirstChildOfClass("Sound");
        const proximityPrompt = crankPrimaryPart.FindFirstChildOfClass("ProximityPrompt");
        if (proximityPrompt === undefined || sound === undefined) return;
        const performSpinSequence = () => {
            const update = (rotation: number) => {
                return (crankPrimaryPart.CFrame = crankPrimaryPartOriginal.mul(
                    CFrame.Angles(0, 0, math.rad(rotation)),
                ));
            };
            sound.Play();
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
        };

        proximityPrompt.Triggered.Connect(() => crankedPacket.toServer(model));
        crankedPacket.fromServer(model, performSpinSequence);
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => HandCrank.load(model, this));
    }

    setCallback(callback: (timeSinceCrank: number, model: Model) => void) {
        this.callback = callback;
        return this;
    }
}
