import { packet } from "@rbxts/fletchette";
import { IS_SERVER } from "shared/Context";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Clickable from "shared/item/traits/action/Clickable";

const clientClickedPacket = packet<(placementId: string) => void>();

export default class Manumatic extends ItemTrait {
    static readonly CLIENT_CLICK_CALLBACKS = new Map<string, (player: Player) => void>();

    static load(model: Model, manumatic: Manumatic) {
        const clickable = manumatic.item.trait(Clickable);

        let last = 0;
        const click = (player: Player | undefined, value: number) => {
            const onClick = clickable.onClick;
            if (onClick !== undefined) {
                onClick(model, clickable, player, value);
            }
        };
        this.CLIENT_CLICK_CALLBACKS.set(model.Name, (player) => {
            const now = tick();
            if (now - last < clickable.debounce) {
                return;
            }
            click(player, 1);
            last = now;
        });
        model.Destroying.Once(() => {
            this.CLIENT_CLICK_CALLBACKS.delete(model.Name);
        });

        const event = new Instance("BindableEvent");
        event.Name = "Click";
        event.Event.Connect((clickValue: number) => click(undefined, clickValue));
        event.Parent = model;
    }

    static clientLoad(model: Model, _manumatic: Manumatic) {
        const clickDetector = new Instance("ClickDetector");
        clickDetector.MouseClick.Connect(() => {
            clientClickedPacket.toServer(model.Name);
        });
        clickDetector.Parent = model.WaitForChild("ClickArea");
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Manumatic.load(model, this));
        item.onClientLoad((model) => Manumatic.clientLoad(model, this));
    }

    static {
        if (IS_SERVER) {
            const connection = clientClickedPacket.fromClient((player, placementId) => {
                const callback = this.CLIENT_CLICK_CALLBACKS.get(placementId);
                if (callback !== undefined) {
                    callback(player);
                }
            });
            eat(connection, "Disconnect");
        }
    }
}
