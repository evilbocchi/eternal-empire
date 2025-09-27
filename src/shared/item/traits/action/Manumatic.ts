import { packet } from "@rbxts/fletchette";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Clickable from "shared/item/traits/action/Clickable";
import perItemPacket from "shared/item/utils/perItemPacket";

const clientClickedPacket = perItemPacket(packet<(placementId: string) => void>());

export default class Manumatic extends ItemTrait {
    static load(model: Model, manumatic: Manumatic) {
        const clickable = manumatic.item.trait(Clickable);

        let last = 0;
        const click = (player: Player | undefined, value: number) => {
            const onClick = clickable.onClick;
            if (onClick !== undefined) {
                onClick(model, clickable, player, value);
            }
        };
        clientClickedPacket.fromClient(model, (player) => {
            const now = tick();
            if (now - last < clickable.debounce) {
                return;
            }
            click(player, 1);
            last = now;
        });

        const event = new Instance("BindableEvent");
        event.Name = "Click";
        event.Event.Connect((clickValue: number) => click(undefined, clickValue));
        event.Parent = model;
    }

    static clientLoad(model: Model, _manumatic: Manumatic) {
        const clickDetector = new Instance("ClickDetector");
        clickDetector.MouseClick.Connect(() => {
            clientClickedPacket.toServer(model);
        });
        clickDetector.Parent = model.WaitForChild("ClickArea");
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Manumatic.load(model, this));
        item.onClientLoad((model) => Manumatic.clientLoad(model, this));
    }
}
