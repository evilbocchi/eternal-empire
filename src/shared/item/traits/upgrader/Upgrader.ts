//!native
//!optimize 2
import Signal from "@antivivi/lemon-signal";
import { findBaseParts, getAllInstanceInfo, setInstanceInfo, simpleInterval } from "@antivivi/vrldk";
import { exactSetProperty } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import type Condenser from "shared/item/traits/dropper/Condenser";
import Operative, { IOperative } from "shared/item/traits/Operative";
import type OmniUpgrader from "shared/item/traits/upgrader/OmniUpgrader";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";

declare global {
    interface ItemTraits {
        Upgrader: Upgrader;
    }

    interface UpgradeInfo {
        /**
         * The upgrader model that applied this upgrade. If the model is destroyed,
         * the upgrade is considered inactive.
         */
        Upgrader: Model;
        /**
         * The upgrade's boost stats.
         */
        Boost?: IOperative;
        /**
         * An upgrade that effectively does nothing. Toggled by {@link Condenser}.
         */
        EmptyUpgrade?: boolean;
    }

    interface InstanceInfo {
        /** The ID of the laser that this instance is associated with. */
        LaserId?: string;
        /** The upgrades applied to this instance, keyed by laser ID. */
        Upgrades?: Map<string, UpgradeInfo>;
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

    static readonly SPAWNED_LASERS = new Map<string, Set<BasePart>>();

    /**
     * Upgrades a droplet with the given upgrader.
     */
    static upgrade({
        model,
        modelInfo = getAllInstanceInfo(model),
        upgrader,
        dropletInfo,
        laserId,
        laserInfo,
        droplet,
        deco,
    }: {
        /** The upgrader model. */
        model: Model;
        /** The information about the upgrader model. */
        modelInfo?: InstanceInfo;
        /** The upgrader being used. */
        upgrader: Upgrader;
        /** The information about the droplet being upgraded. */
        dropletInfo: InstanceInfo;
        /** The ID of the laser that is upgrading the droplet. */
        laserId?: string;
        /** The information about the laser that is upgrading the droplet. */
        laserInfo: InstanceInfo;
        /** The droplet being upgraded. */
        droplet: BasePart;
        /** An optional decoration function to modify the upgrade info. */
        deco?: (upgrade: UpgradeInfo) => void;
    }) {
        if (dropletInfo.Incinerated === true) return;
        if (upgrader.requirement !== undefined && !upgrader.requirement(dropletInfo)) return;

        if (laserInfo.Sky === true) dropletInfo.Sky = true;
        let upgrades = dropletInfo.Upgrades;

        if (laserId === undefined) {
            laserId ??= upgrader.isStacks === false ? upgrader.item.id : model.Name + "_" + laserInfo.LaserId;
        }

        if (upgrades === undefined) upgrades = new Map();
        else if (upgrades.has(laserId)) return;

        if (isPlacedItemUnusable(modelInfo) || laserInfo.Maintained === false) return;

        if (upgrades === undefined) upgrades = new Map();
        let [totalAdd, totalMul, totalPow] = [upgrader.add, upgrader.mul, upgrader.pow];

        const boosts = modelInfo.Boosts;
        if (boosts !== undefined) {
            for (const [_, boost] of boosts) {
                const stats = boost.upgradeCompound;
                if (stats === undefined) continue;
                [totalAdd, totalMul, totalPow] = Operative.applySpreadOperative(
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
        dropletInfo.Upgrades = upgrades;
        modelInfo.OnUpgraded?.fire(droplet);
    }

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
        const modelInfo = getAllInstanceInfo(model);
        const laserInfo = getAllInstanceInfo(laser);
        VirtualCollision.onDropletTouched(model, laser, (droplet, dropletInfo) => {
            this.upgrade({ model, modelInfo, upgrader, dropletInfo, laserInfo, droplet, deco });
        });
        laserInfo.ItemModelInfo = modelInfo;
        model.Destroying.Once(() => {
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

    static sharedLoad(model: Model, upgrader: Upgrader) {
        const set = new Set<BasePart>();
        for (const laser of findBaseParts(model, "Laser")) {
            set.add(laser);
        }
        this.SPAWNED_LASERS.set(model.Name, set);
        model.Destroying.Once(() => this.SPAWNED_LASERS.delete(model.Name));
    }

    constructor(item: Item) {
        super(item);
        item.onSharedLoad((model) => Upgrader.sharedLoad(model, this));
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
        const toAdd = isNotOmni ? boost.add : (boost as OmniUpgrader).addsPerLaser?.get(omni);
        const toMul = isNotOmni ? boost.mul : (boost as OmniUpgrader).mulsPerLaser?.get(omni);
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
            [add, mul, pow] = this.applySpreadOperative(totalAdd, totalMul, totalPow, add, mul, pow, inverse);
            totalAdd = add ?? totalAdd;
            totalMul = mul ?? totalMul;
            totalPow = pow ?? totalPow;
        }
        return $tuple(totalAdd, totalMul, totalPow);
    }

    static {
        const hiddenUpgradersPacket = exactSetProperty<string>();

        if (IS_SERVER || IS_EDIT) {
            const cleanup = simpleInterval(() => {
                const set = new Set<string>();
                for (const [placementId] of this.SPAWNED_LASERS) {
                    const model = Server.Item.modelPerPlacementId.get(placementId);
                    if (model === undefined) continue;
                    if (isPlacedItemUnusable(getAllInstanceInfo(model))) {
                        set.add(placementId);
                    }
                }
                hiddenUpgradersPacket.set(set);
            }, 0.5);
            eat(cleanup);
        }

        if (!IS_SERVER || IS_EDIT) {
            const connection = hiddenUpgradersPacket.observe((placementIds) => {
                for (const [placementId, lasers] of this.SPAWNED_LASERS) {
                    const isHidden = placementIds.has(placementId);
                    for (const laser of lasers) {
                        laser.LocalTransparencyModifier = isHidden ? 1 : 0;
                    }
                }
            });
            eat(connection, "Disconnect");
        }
    }
}
