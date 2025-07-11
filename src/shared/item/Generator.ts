//!native

import { RunService } from "@rbxts/services";
import Price from "shared/Price";
import Item from "shared/item/Item";
import NamedUpgrade from "./NamedUpgrade";

class Generator extends Item {
    
    passiveGain: Price | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Generator");
        this.onLoad((model, utils) => {
            const remoteEvent = new Instance("UnreliableRemoteEvent", model);
            const boostsFolder = new Instance("Folder");
            boostsFolder.Name = "Boosts";
            boostsFolder.Parent = model;

            task.spawn(() => {
                let t = 0;
                const c = RunService.Heartbeat.Connect((dt) => {
                    t += dt;
                    if (t > 0.5) {
                        const passiveGain = this.passiveGain;
                        if (passiveGain !== undefined) {
                            let delta = passiveGain.mul(t);
                            const boosted = new Set<string>();
                            for (const boolValue of boostsFolder.GetChildren()) {
                                const placedItem = utils.getPlacedItem(boolValue.Name);
                                if (placedItem !== undefined) {
                                    const check = placedItem.placementId ?? "no name";
                                    if (boosted.has(check))
                                        continue;
                                    boosted.add(check);
                                    const item = utils.getItem(placedItem.item);
                                    if (item !== undefined && item.isA("Charger")) {
                                        const mul = item.mul;
                                        if (mul !== undefined)
                                            delta = delta.mul(mul);
                                    }
                                }
                                else {
                                    boolValue.Destroy();
                                }
                            }
                            for (const [upgradeId, amount] of pairs(utils.getAmountPerUpgrade())) {
                                const upgrade = NamedUpgrade.getUpgrade(upgradeId as string);
                                if (upgrade === undefined)
                                    continue;
                                const formula = upgrade.generatorFormula;
                                if (formula !== undefined) {
                                    delta = formula(delta, amount, upgrade.step);
                                }
                            }
                            const boost = model.GetAttribute("GeneratorBoost") as number | undefined;
                            if (boost !== undefined) {
                                delta = delta.mul(boost);
                            }
                            remoteEvent.FireAllClients(delta.costPerCurrency);
                            utils.setBalance(utils.getBalance().add(delta));
                        }
                        t = 0;
                    }
                });
                model.Destroying.Connect(() => c.Disconnect());
            });
        });
    }
    
    setPassiveGain(passiveGain: Price) {
        this.passiveGain = passiveGain;
        return this;
    }
}

export = Generator;