import { RunService } from "@rbxts/services";
import Price from "shared/Price";
import Item from "shared/item/Item";

class Generator extends Item {
    
    passiveGain: Price | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Generator");
        this.onLoad((model, utils) => {
            const boostsFolder = new Instance("Folder");
            boostsFolder.Name = "Boosts";
            boostsFolder.Parent = model;
            task.spawn(() => {
                let t = 0;
                const c = RunService.Heartbeat.Connect((dt) => {
                    t += dt;
                    if (t > 0.5) {
                        const passiveGain = this.getPassiveGain();
                        if (passiveGain !== undefined) {
                            utils.setBalance(utils.getBalance().add(passiveGain.mul(t)));
                        }
                        t = 0;
                    }
                });
                model.Destroying.Connect(() => c.Disconnect());
            });
        });
    }
    
    getPassiveGain() {
        return this.passiveGain;
    }

    setPassiveGain(passiveGain: Price) {
        this.passiveGain = passiveGain;
        return this;
    }
}

export = Generator;