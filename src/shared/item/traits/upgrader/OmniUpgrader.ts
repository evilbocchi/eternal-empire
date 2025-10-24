import { getAllInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

declare global {
    interface ItemTraits {
        OmniUpgrader: OmniUpgrader;
    }
}

export default class OmniUpgrader extends Upgrader {
    skysPerLaser = new Map<string, boolean>();
    addsPerLaser = new Map<string, CurrencyBundle>();
    mulsPerLaser = new Map<string, CurrencyBundle>();
    readonly lasers = new Set<string>();

    static load(model: Model, omniUpgrader: OmniUpgrader) {
        for (const laserName of omniUpgrader.lasers) {
            const laser = model.WaitForChild(laserName) as BasePart;
            laser.CanTouch = true;
            const laserInfo = getAllInstanceInfo(laser);
            laserInfo.laserId = laserName;
            laserInfo.sky = omniUpgrader.skysPerLaser.get(laserName) ?? omniUpgrader.sky;
            super.hookLaser(model, omniUpgrader, laser, (upgradeInfo) => {
                upgradeInfo.boost = {
                    add: omniUpgrader.addsPerLaser.get(laserName) ?? omniUpgrader.add,
                    mul: omniUpgrader.mulsPerLaser.get(laserName) ?? omniUpgrader.mul,
                    pow: omniUpgrader.pow,
                };
            });
        }
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => OmniUpgrader.load(model, this));
    }

    setSkys(skysPerLaser: Map<string, boolean>) {
        this.skysPerLaser = skysPerLaser;
        for (const [laser] of skysPerLaser) this.lasers.add(laser);
        return this;
    }

    setAdds(addsPerLaser: Map<string, CurrencyBundle>) {
        this.addsPerLaser = addsPerLaser;
        for (const [laser] of addsPerLaser) this.lasers.add(laser);
        return this;
    }

    setMuls(mulsPerLaser: Map<string, CurrencyBundle>) {
        this.mulsPerLaser = mulsPerLaser;
        for (const [laser] of mulsPerLaser) this.lasers.add(laser);
        return this;
    }
}
