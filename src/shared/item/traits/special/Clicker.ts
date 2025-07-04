import { OnoeNum } from "@antivivi/serikanum";
import { formatRichText, getAllInstanceInfo, Streaming } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import { Server, getPlacedItemsInArea } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Clicker: Clicker;
    }

    interface InstanceInfo {
        ClickRateModifiers?: Set<Modifier>;
    }
}


export default class Clicker extends ItemTrait {

    static load(model: Model, clicker: Clicker) {
        const Items = Server.items;

        const instanceInfo = getAllInstanceInfo(model);
        const modifiers = new Set<Modifier>();
        instanceInfo.ClickRateModifiers = modifiers;

        const fireClickRemote = Streaming.createStreamableRemote(model, true);

        const clickArea = model.WaitForChild("ClickArea") as BasePart;
        clickArea.CanTouch = true;
        clickArea.CollisionGroup = "ItemHitbox";
        clickArea.Touched.Connect(() => { });

        let target: Model | undefined;
        let event: BindableEvent | undefined;
        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (target === undefined || target.Parent === undefined) {
                if (t > 0.05) {
                    t = 0;
                    const found = getPlacedItemsInArea(clickArea, Items);
                    for (const [model, item] of found)
                        if (item.isA("Clickable")) {
                            target = model;
                            return;
                        }
                }
            }
            else if (t > 1 / (clicker.clickRate ?? 999)) {
                t = 0;
                if (event === undefined || event.Parent === undefined) {
                    event = target.WaitForChild("Click") as BindableEvent;
                }

                let rate = 1;
                for (const modifier of modifiers) {
                    rate *= modifier.multi;
                }
                event.Fire(clicker.clickValue * rate);

                if (clicker.onClick !== undefined)
                    clicker.onClick(model, clicker);
                if (clicker.replicatingClicks === true)
                    fireClickRemote();
            }
        });
        model.Destroying.Once(() => connection.Disconnect());
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
        return str.gsub("%%cps%%", formatRichText(`${OnoeNum.toString(this.getCPS())} CPS`, CURRENCY_DETAILS["Purifier Clicks"].color))[0];
    }
}