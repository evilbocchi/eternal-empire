import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Furnace from "shared/item/Furnace";
import Items from "shared/item/Items";
import Upgrader from "shared/item/Upgrader";

class ValueCalculator {
    static calculateDropletValue(dropletModel: BasePart) {
        const droplet = Droplet.getDroplet(dropletModel.GetAttribute("DropletId") as string) as Droplet;
        let worth = droplet.getValue();
        if (worth === undefined) {
            return;
        }
        for (const upgrade of dropletModel.GetChildren()) {
            if (upgrade.IsA("ObjectValue") && upgrade.Value !== undefined && upgrade.Value.Parent !== undefined) {
                const item = Items.getItem(upgrade.GetAttribute("ItemId") as string) as Upgrader | undefined;
                if (item !== undefined)
                    worth = item.getResult(worth);
            }
        }
        return worth;
    }

    static calculateGain(droplet: BasePart, furnace?: Furnace, model?: Model) {
        const dropletValue = ValueCalculator.calculateDropletValue(droplet);
        if (dropletValue !== undefined && furnace !== undefined) {
            const pv = furnace.getProcessValue();
            if (pv === undefined) {
                return undefined;
            }
            return model === undefined ? pv.mul(dropletValue) : pv.mul(dropletValue).mul((model.GetAttribute("V") as number) ?? 1);
        }
    }
}

export = ValueCalculator;