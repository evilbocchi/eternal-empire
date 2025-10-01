import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Dropper from "shared/item/traits/dropper/Dropper";

export type RepairResultTier = "Perfect" | "Great" | "Good";

export type RepairProtectionTier = Extract<RepairResultTier, "Great" | "Perfect">;

export interface RepairProtectionState {
    tier: RepairProtectionTier;
    expiresAt: number;
}

export interface RepairBoostConfig {
    conveyorSpeedMultiplier: number;
    dropRateMultiplier: number;
    upgraderMul: number;
}

export const REPAIR_BOOST_KEY = "RepairBoost";

export const REPAIR_PROTECTION_DURATIONS: Record<RepairProtectionTier, number> = {
    Great: 5 * 60, // seconds
    Perfect: 10 * 60,
};

export const REPAIR_BOOST_MULTIPLIERS: Record<RepairProtectionTier, number> = {
    Great: 1.05,
    Perfect: 1.15,
};

export function isProtectionTier(tier: RepairResultTier): tier is RepairProtectionTier {
    return tier === "Great" || tier === "Perfect";
}

function ensureBoostContainers(info: InstanceInfo) {
    if (info.Boosts === undefined) {
        info.Boosts = new Map<string, ItemBoost>();
    }
    if (info.BoostAdded === undefined) {
        info.BoostAdded = new Set<(boost: ItemBoost) => void>();
    }
    if (info.BoostRemoved === undefined) {
        info.BoostRemoved = new Set<(boost: ItemBoost) => void>();
    }
}

export function applyRepairBoostToItem(modelInfo: InstanceInfo, item: Item, tier: RepairProtectionTier) {
    const multiplier = REPAIR_BOOST_MULTIPLIERS[tier] ?? 1;

    if (item.isA("Conveyor") && multiplier !== 1) {
        ensureBoostContainers(modelInfo);
        Boostable.addBoost(modelInfo, REPAIR_BOOST_KEY, {
            ignoresLimitations: true,
            conveyorSpeedMul: multiplier,
        });
        modelInfo.UpdateSpeed?.();
    }

    if (item.isA("Upgrader") && multiplier !== 1) {
        ensureBoostContainers(modelInfo);
        Boostable.addBoost(modelInfo, REPAIR_BOOST_KEY, {
            ignoresLimitations: true,
            upgradeCompound: {
                mul: CurrencyBundle.ones().mul(multiplier),
            },
        });
    }

    if (item.isA("Dropper") && multiplier !== 1) {
        for (const [_drop, dropInfo] of Dropper.SPAWNED_DROPS) {
            if (dropInfo.ItemModelInfo !== modelInfo) continue;
            ensureBoostContainers(dropInfo);
            Boostable.addBoost(dropInfo, REPAIR_BOOST_KEY, {
                ignoresLimitations: true,
                dropRateMul: multiplier,
            });
        }
    }
}

export function clearRepairBoostFromModel(modelInfo: InstanceInfo) {
    if (modelInfo.Boosts?.has(REPAIR_BOOST_KEY)) {
        Boostable.removeBoost(modelInfo, REPAIR_BOOST_KEY);
        modelInfo.UpdateSpeed?.();
    }

    for (const [_drop, dropInfo] of Dropper.SPAWNED_DROPS) {
        if (dropInfo.ItemModelInfo !== modelInfo) continue;
        if (dropInfo.Boosts?.has(REPAIR_BOOST_KEY)) {
            Boostable.removeBoost(dropInfo, REPAIR_BOOST_KEY);
        }
    }
}
