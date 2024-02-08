import { Debris, Players, RunService, TweenService } from "@rbxts/services";
import { AREAS } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

class Dropper extends Item {
    
    droplet: Droplet | undefined;
    dropRate: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Dropper");
        this.onLoad((model, utils) => {
            for (const d of findBaseParts(model, "Drop")) {
                const instantiator = this.getDroplet()?.getInstantiator(model, d.CFrame, utils);
                const areaId = utils.getPlacedItem(model.Name)?.area;
                if (instantiator !== undefined && areaId !== undefined) {
                    const area = AREAS[areaId as keyof (typeof AREAS)];
                    const dropletLimit = area.dropletLimit;
                    const dropletCount = area.areaFolder.WaitForChild("DropletCount") as IntValue;
                    let t = 0;
                    const connection = RunService.Heartbeat.Connect((deltaTime) => {
                        t += deltaTime;
                        if (t > 1 / (d.GetAttribute("DropRate") as number | undefined ?? (this.getDropRate() ?? 1))) {
                            if (dropletCount.Value > dropletLimit.Value) {
                                return;
                            }
                            t = 0;
                            instantiator();
                        }
                    });
                    model.Destroying.Once(() => connection.Disconnect());
                }
            }
        })
    }

    getDroplet() {
        return this.droplet;
    }

    setDroplet(droplet: Droplet) {
        this.droplet = droplet;
        return this;
    }

    getDropRate() {
        return this.dropRate;
    }

    setDropRate(dropRate: number) {
        this.dropRate = dropRate;
        return this;
    }
}

export = Dropper;