import { Debris } from "@rbxts/services";
import Price from "shared/Price";
import Item from "shared/item/Item";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

class Furnace extends Item {
    
    processValue: Price | undefined;
    variance: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Furnace");
        this.onLoad((model, utils, item) => {
            for (const d of findBaseParts(model, "Lava")) {
                d.SetAttribute("ItemId", this.id);
                d.Touched.Connect((droplet) => {
                    if (droplet.Name === "Droplet") {
                        droplet.Name = "IncineratedDroplet";
                        task.delay(0.5, () => {
                            if (droplet !== undefined)
                                droplet.Anchored = true;
                        });
                        Debris.AddItem(droplet, 4);
                        const worth = model.GetAttribute("Maintained") === true ? utils.calculateGain(droplet, this, model) : new Price();
                        if (worth === undefined)
                            return;
                        utils.setBalance(utils.getBalance().add(worth));
                        droplet.FindFirstChildOfClass("UnreliableRemoteEvent")?.FireAllClients(worth.costPerCurrency);                        
                    }
                });
            }
            const variance = this.variance;
            if (variance !== undefined && this.variance !== 0) {
                item.repeat(model, () => model.SetAttribute("V", (math.random() * variance) + 1 - (variance * 0.5)), 0.7);
            }
            this.maintain(model, utils);
        });
    }

    getProcessValue() {
        return this.processValue;
    }

    setProcessValue(processValue: Price) {
        this.processValue = processValue;
        return this;
    }

    getVariance() {
        return this.variance;
    }

    setVariance(variance: number) {
        this.variance = variance;
        return this;
    }
}

export = Furnace;