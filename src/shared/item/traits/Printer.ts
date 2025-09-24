import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Packets from "shared/Packets";

declare global {
    interface ItemTraits {
        Printer: Printer;
    }

    interface Setup {
        name: string;
        area: AreaId;
        autoloads: boolean;
        calculatedPrice: BaseCurrencyMap;
        items: Array<PlacedItem>;
        alerted: boolean;
    }
}

export default class Printer extends ItemTrait {
    static load(model: Model) {
        model.AddTag("Printer");
    }

    static clientLoad(model: Model) {
        const fill = model.WaitForChild("Fill") as BasePart;
        const connection = Packets.printedSetups.observe((value) => {
            if (fill !== undefined) fill.Transparency = value.size() > 0 ? 0.25 : 0.8;
        });
        model.Destroying.Once(() => connection.disconnect());
    }

    area: AreaId | undefined;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Printer.load(model));
        item.onClientLoad((model) => Printer.clientLoad(model));
    }

    setArea(area: AreaId) {
        this.area = area;
        return this;
    }

    static getPrintedSetupsInArea(printedSetups: Map<string, Setup>, area: AreaId) {
        const setups = new Map<string, Setup>();
        for (const [name, setup] of printedSetups) if (setup.area === area) setups.set(name, setup);
        return setups;
    }
}
