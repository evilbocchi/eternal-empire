import Signal from "@antivivi/lemon-signal";
import { findBaseParts, getAllInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Operative, { IOperative } from "shared/item/traits/Operative";
import type OmniUpgrader from "shared/item/traits/upgrader/OmniUpgrader";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";

declare global {
    interface ItemTraits {
        Upgrader: Upgrader;
    }

    interface UpgradeInfo {
        Upgrader: Model;
        Boost?: IOperative;
        EmptyUpgrade?: boolean;
    }

    interface InstanceInfo {
        /** The ID of the laser that this instance is associated with. */
        LaserId?: string;
        Enabled?: boolean;
        /** The upgrades applied to this instance, keyed by laser ID. */
        Upgrades?: Map<string, UpgradeInfo>;
        ParentInfo?: InstanceInfo;
        OriginalTransparency?: number;
        CurrentTransparency?: number;
        OnUpgraded?: Signal<BasePart>;

        /**
         * Whether the droplet has reached the skyline.
         * The skyline is located at the at the level in which droplets are high to fall into cauldrons.
         * This allows the droplets to be upgraded before being dropped into cauldrons.
         *
         * This property exists to prevent exploits in which droplets that have not reached the skyline are dropped into cauldrons.
         */
        Sky?: boolean;
    }

    interface ItemBoost {
        /**
         * The operative that upgrades the {@link Upgrader} that is boosted.
         *
         * This is used to apply the boost to the upgrader's lasers.
         */
        upgradeCompound?: IOperative;
    }
}

/**
 * An upgrader is an item that has lasers that upgrade droplets that pass through them.
 */
export default class Upgrader extends Operative {
    /**
     * A function that checks whether a droplet meets the requirements to be upgraded.
     */
    requirement?: (dropletInfo: InstanceInfo) => boolean;

    /**
     * Whether the upgrader makes droplets reach the skyline after being upgraded.
     */
    sky?: boolean;

    /**
     * Whether the lasers in this upgrader upgrade droplets independently.
     */
    isStacks?: boolean;

    /**
     * A map of lasers that have been spawned by this upgrader class.
     *
     * The key is the laser part, and the value is its instance information.
     */
    static readonly SPAWNED_LASERS = new Map<BasePart, InstanceInfo>();

    /**
     * Hooks a laser to an upgrader.
     *
     * @param model The item model where the laser is located.
     * @param upgrader The upgrader instance that will manage the laser.
     * @param laser The laser part being hooked.
     * @param upgradedEvent The event fired when the laser is upgraded.
     * @param deco Optional decoration function to modify the upgrade info.
     */
    static hookLaser(model: Model, upgrader: Upgrader, laser: BasePart, deco?: (upgrade: UpgradeInfo) => void) {
        const item = upgrader.item;
        const modelInfo = getAllInstanceInfo(model);
        const laserInfo = getAllInstanceInfo(laser);
        const placementId = model.Name;
        VirtualCollision.onDropletTouched(model, laser, (droplet, instanceInfo) => {
            if (instanceInfo.Incinerated === true) return;
            if (upgrader.requirement !== undefined && !upgrader.requirement(instanceInfo)) return;

            if (laserInfo.Sky === true) instanceInfo.Sky = true;
            let upgrades = instanceInfo.Upgrades;

            const laserId = upgrader.isStacks === false ? item.id : placementId + "_" + laserInfo.LaserId;
            if (upgrades === undefined) upgrades = new Map();
            else if (upgrades.has(laserId)) return;

            if (modelInfo.Maintained === false || laserInfo.Enabled === false) return;

            let [totalAdd, totalMul, totalPow] = [upgrader.add, upgrader.mul, upgrader.pow];

            const boosts = modelInfo.Boosts;
            if (boosts !== undefined) {
                for (const [_, boost] of boosts) {
                    const stats = boost.upgradeCompound;
                    if (stats === undefined) continue;
                    [totalAdd, totalMul, totalPow] = Operative.applyOperative(
                        totalAdd,
                        totalMul,
                        totalPow,
                        stats.add,
                        stats.mul,
                        stats.pow,
                    );
                }
            }

            const upgrade: UpgradeInfo = {
                Upgrader: model,
                Boost: {
                    add: totalAdd,
                    mul: totalMul,
                    pow: totalPow,
                },
            };

            if (deco !== undefined) deco(upgrade);
            upgrades.set(laserId, upgrade);
            instanceInfo.Upgrades = upgrades;
            modelInfo.OnUpgraded?.fire(droplet);
        });
        laserInfo.ParentInfo = modelInfo;
        laserInfo.OriginalTransparency = laser.Transparency;
        this.SPAWNED_LASERS.set(laser, laserInfo);
        model.Destroying.Once(() => {
            this.SPAWNED_LASERS.delete(laser);
            modelInfo.OnUpgraded?.destroy();
        });
    }

    static load(model: Model, upgrader: Upgrader) {
        setInstanceInfo(model, "OnUpgraded", new Signal());
        const item = upgrader.item;
        let i = 0;
        for (const laser of findBaseParts(model, "Laser")) {
            const laserInfo = getAllInstanceInfo(laser);
            laserInfo.LaserId = tostring(i);
            laserInfo.Sky = upgrader.sky;
            Upgrader.hookLaser(model, upgrader, laser);
            i++;
        }
        item.maintain(model);
    }

    constructor(item: Item) {
        super(item);
        item.trait(Boostable).addToWhitelist("dummy"); // Enable whitelist to stop charger connection
        item.onLoad((model) => Upgrader.load(model, this));
    }

    /**
     * Set whether droplets passing through this upgrader will reach the skyline after being upgraded.
     *
     * @param sky Whether the upgrader makes droplets reach the skyline.
     * @returns The upgrader instance for chaining.
     */
    setSky(sky: boolean) {
        this.sky = sky;
        return this;
    }

    /**
     * Set whether this upgrader has multiple lasers that each independently upgrade droplets.
     *
     * @param isStacks Whether the upgrader has multiple lasers that upgrade droplets independently. Defaults to true.
     * @returns The upgrader instance for chaining.
     */
    stacks(isStacks: boolean) {
        this.isStacks = isStacks;
        return this;
    }

    /**
     * Sets a requirement for droplets to be upgraded by this upgrader.
     *
     * @param requirement A function that takes the droplet's instance information and returns whether it should be upgraded.
     * @returns The upgrader instance for chaining.
     */
    setRequirement(requirement: (dropletInfo: InstanceInfo) => boolean) {
        this.requirement = requirement;
        return this;
    }

    /**
     * Gets the boosts an upgrade from an Upgrader would give.
     *
     * @param upgradeInfo Upgrade information
     * @returns Boosts
     */
    static getUpgrade(
        upgradeInfo: UpgradeInfo,
    ): LuaTuple<[CurrencyBundle?, CurrencyBundle?, CurrencyBundle?, boolean?]> {
        const boost = upgradeInfo.Boost;
        if (boost === undefined) return $tuple();

        const omni = upgradeInfo.Omni;
        const isNotOmni = omni === undefined;
        const toAdd = isNotOmni ? boost.add : (boost as OmniUpgrader).addsPerLaser.get(omni);
        const toMul = isNotOmni ? boost.mul : (boost as OmniUpgrader).mulsPerLaser.get(omni);
        const toPow = boost.pow;
        const isGone = upgradeInfo.Upgrader === undefined || upgradeInfo.Upgrader.Parent === undefined;
        const isEmpty = upgradeInfo.EmptyUpgrade === true;
        if (isGone || isEmpty) {
            if (isGone && isEmpty) return $tuple(toAdd, toMul, toPow, true);

            return $tuple();
        }

        return $tuple(toAdd, toMul, toPow, false);
    }

    /**
     * Apply boosts from Upgraders to a revenue source.
     *
     * @param totalAdd Addition term to apply.
     * @param totalMul Multiplication term to apply.
     * @param totalPow Power term to apply.
     * @param instanceInfo Instance information of the revenue source. Usually a droplet.
     * @returns The resulting boosts.
     */
    static applyUpgrades(
        totalAdd: CurrencyBundle,
        totalMul: CurrencyBundle,
        totalPow: CurrencyBundle,
        instanceInfo: InstanceInfo,
    ) {
        for (const [_id, upgradeInfo] of instanceInfo.Upgrades!) {
            let [add, mul, pow, inverse] = this.getUpgrade(upgradeInfo);
            [add, mul, pow] = this.applyOperative(totalAdd, totalMul, totalPow, add, mul, pow, inverse);
            totalAdd = add ?? totalAdd;
            totalMul = mul ?? totalMul;
            totalPow = pow ?? totalPow;
        }
        return $tuple(totalAdd, totalMul, totalPow);
    }

    static {
        const connection = RunService.Heartbeat.Connect(() => {
            for (const [laser, info] of this.SPAWNED_LASERS) {
                const toSet = info.ParentInfo!.Maintained === true ? info.OriginalTransparency! : 1;
                if (info.CurrentTransparency !== toSet) {
                    info.CurrentTransparency = toSet;
                    laser.Transparency = toSet;
                }
            }
        });
    }
}
