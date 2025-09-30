export type RepairResultTier = "Perfect" | "Great" | "Good";

export type RepairProtectionTier = Extract<RepairResultTier, "Great" | "Perfect">;

export interface RepairProtectionState {
    tier: RepairProtectionTier;
    expiresAt: number;
}

export const REPAIR_PROTECTION_DURATIONS: Record<RepairProtectionTier, number> = {
    Great: 5 * 60, // seconds
    Perfect: 10 * 60,
};

export function isProtectionTier(tier: RepairResultTier): tier is RepairProtectionTier {
    return tier === "Great" || tier === "Perfect";
}
