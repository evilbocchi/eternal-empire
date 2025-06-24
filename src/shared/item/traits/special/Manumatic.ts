import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Clickable from "shared/item/traits/special/Clickable";

export default class Manumatic extends ItemTrait {

    static load(model: Model, manumatic: Manumatic) {
        const clickable = manumatic.item.trait(Clickable);

        const clickDetector = new ClickDetector();
        let last = 0;
        const click = (player: Player | undefined, value: number) => {
            const onClick = clickable.onClick;
            if (onClick !== undefined) {
                onClick(model, clickable, player, value);
            }
        };
        clickDetector.MouseClick.Connect((player) => {
            const now = tick();
            if (now - last < clickable.debounce) {
                return;
            }
            click(player, 1);
            last = now;
        });
        clickDetector.Parent = model.WaitForChild("ClickArea");
        const event = new BindableEvent();
        event.Name = "Click";
        event.Event.Connect((clickValue: number) => click(undefined, clickValue));
        event.Parent = model;
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Manumatic.load(model, this));
    }
}