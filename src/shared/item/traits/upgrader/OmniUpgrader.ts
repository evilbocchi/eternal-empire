import { getAllInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

declare global {
    interface ItemTraits {
        OmniUpgrader: OmniUpgrader;
    }
    interface UpgradeInfo {
        /**
         * Defined if the upgrade comes from an {@link OmniUpgrader}.
         * This is used to determine the laser of the upgrade.
         */
        Omni?: string;
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
            laserInfo.LaserId = laser.Name;
            laserInfo.Sky = omniUpgrader.skysPerLaser.get(laser.Name) ?? omniUpgrader.sky;
            super.hookLaser(model, omniUpgrader, laser, (indicator) => (indicator.Omni = laserName));
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
