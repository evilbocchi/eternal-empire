//!native

import Conveyor from "shared/item/Conveyor";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

class Factory extends Conveyor implements Dropper {
    droplet: Droplet | undefined;
    dropletPerDrop = new Map<string, Droplet>();
    instantiatorPerDrop = new Map<BasePart, () => void>();
    dropRate: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Dropper");
        this.types.push("Factory");
        this.onLoad((model, utils) => Dropper.load(model, utils, this));
    }

    getDroplet(dropPart?: string) {
        if (dropPart !== undefined) {
            const cached = this.dropletPerDrop.get(dropPart);
            if (cached !== undefined) {
                return cached;
            }
        }
        return this.droplet;
    }

    setDroplet(droplet: Droplet, dropPart?: string) {
        if (dropPart !== undefined) {
            this.dropletPerDrop.set(dropPart, droplet);
            return this;
        }
        this.droplet = droplet;
        return this;
    }

    setDropRate(dropRate: number) {
        this.dropRate = dropRate;
        return this;
    }

}

export = Factory;