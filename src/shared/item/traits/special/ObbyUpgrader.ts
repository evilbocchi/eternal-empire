import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { GameAPI } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import Upgrader from "shared/item/traits/Upgrader";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

export default class ObbyUpgrader extends ItemTrait {

    static init(obbyUpgrader: ObbyUpgrader) {
        const item = obbyUpgrader.item;
        const upgrader = item.trait(Upgrader);

        item.repeat(undefined, () => {
            const mul = new CurrencyBundle();
            for (const [upgrade, { currency, formula }] of obbyUpgrader.boosts) {
                const amount = GameAPI.upgradeBoardService.getUpgradeAmount(upgrade.id);
                mul.set(currency, formula.apply(new OnoeNum(amount)));
            }
            upgrader.setMul(mul);
        }, 1);
    }

    static load(model: Model, obbyUpgrader: ObbyUpgrader) {
        const obbyPointsGuiPart = model.WaitForChild("ObbyPointsGuiPart") as BasePart;
        const label = obbyPointsGuiPart.FindFirstChildOfClass("SurfaceGui")?.FindFirstChild("TextLabel") as TextLabel | undefined;
        if (label === undefined)
            throw "ObbyPointsGuiPart does not have a TextLabel in its SurfaceGui";
        obbyUpgrader.item.repeat(model, () => {
            label.Text = `OBBY POINTS: ${GameAPI.currencyService.get("Obby Points").toString()}`;
        }, 1);
    }

    readonly boosts = new Map<NamedUpgrade, {
        currency: Currency;
        formula: Formula;
    }>();

    constructor(item: Item) {
        super(item);
        item.trait(Upgrader);
        item.onInit(() => ObbyUpgrader.init(this));
        item.onLoad((model) => ObbyUpgrader.load(model, this));
    }

    setBoost(upgrade: NamedUpgrade, currency: Currency, formula: Formula) {
        this.trait(UpgradeBoard).addUpgrade(upgrade);
        this.boosts.set(upgrade, { currency, formula });
        return this;
    }
}
