import { OnoeNum } from "@antivivi/serikanum";
import { formatRichText, getAllInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import getPlacedItemsInBounds from "shared/item/utils/getPlacedItemsInBounds";
import perItemPacket from "shared/item/utils/perItemPacket";

declare global {
    interface ItemTraits {
        Clicker: Clicker;
    }

    interface Modifier {
        multi: number;
    }

    interface InstanceInfo {
        ClickRateModifiers?: Set<Modifier>;
    }
}

export default class Clicker extends ItemTrait {
    static readonly clickingPacket = perItemPacket(packet<(placementId: string) => void>({ isUnreliable: true }));

    static load(model: Model, clicker: Clicker) {
        const Items = Server.Items;

        const instanceInfo = getAllInstanceInfo(model);
        const modifiers = new Set<Modifier>();
        instanceInfo.ClickRateModifiers = modifiers;

        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.CanTouch = true;
        clickArea.CollisionGroup = "ItemHitbox";
        clickArea.Touched.Connect(() => {});

        let target: Model | undefined;
        let event: BindableEvent | undefined;
        let t = 0;
        clicker.item.repeat(model, (dt) => {
            t += dt;
            if (target === undefined || target.Parent === undefined) {
                if (t > 0.05) {
                    t = 0;
                    const found = getPlacedItemsInBounds(clickArea, Items);
                    for (const [model, item] of found)
                        if (item.isA("Clickable")) {
                            target = model;
                            return;
                        }
                }
            } else if (t > 1 / (clicker.clickRate ?? 999)) {
                t = 0;
                if (event === undefined || event.Parent === undefined) {
                    event = target.WaitForChild("Click") as BindableEvent;
                }

                let rate = 1;
                for (const modifier of modifiers) {
                    rate *= modifier.multi;
                }
                event.Fire(clicker.clickValue * rate);

                if (clicker.onClick !== undefined) clicker.onClick(model, clicker);
                if (clicker.replicatingClicks === true) this.clickingPacket.toAllClients(model);
            }
        });
    }

    replicatingClicks = false;
    clickRate: number | undefined = undefined;
    clickValue = 1;
    onClick: ((model: Model, item: this) => void) | undefined = undefined;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Clicker.load(model, this));
    }

    getCPS() {
        return (this.clickRate ?? 999) * this.clickValue;
    }

    setClickRate(clickRate: number) {
        this.clickRate = clickRate;
        return this;
    }

    setClickValue(clickValue: number) {
        this.clickValue = clickValue;
        return this;
    }

    setOnClick(onClick: (model: Model, item: this) => void) {
        this.onClick = onClick;
        return this;
    }

    replicateClicks() {
        this.replicatingClicks = true;
        return this;
    }

    format(str: string) {
        return str.gsub(
            "%%cps%%",
            formatRichText(`${OnoeNum.toString(this.getCPS())} CPS`, CURRENCY_DETAILS["Purifier Clicks"].color),
        )[0];
    }

    /**
     * Sets up a handler that is called when this clicker has clicked from the server.
     * @param model The model of the clicker.
     * @param callback The callback to call when the clicker is clicked.
     */
    fromServerClicked(model: Model, callback: () => void) {
        Clicker.clickingPacket.fromServer(model, callback);
    }
}
