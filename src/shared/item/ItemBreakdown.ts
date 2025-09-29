//!native
//!optimize 2

import { Workspace } from "@rbxts/services";

/**
 * Range (in seconds) between automatic breakdown events for placed items.
 * A random interval within this range will be selected whenever an item is repaired.
 */
export const BREAK_INTERVAL_RANGE: readonly [number, number] = [180, 360];

/**
 * Number of indicator cycles per second for the repair mini-game.
 */
export const REPAIR_INDICATOR_SPEED = 0.75;

/**
 * Width of the target window in the repair mini-game expressed as a fraction of the track (0-1).
 */
export const REPAIR_TARGET_WIDTH = 0.14;

/**
 * Additional tolerance applied server-side to account for latency.
 */
export const REPAIR_LATENCY_TOLERANCE = 0.05;

export interface ItemBreakdownState {
    /**
     * UNIX timestamp (server time) when the item will break next.
     */
    nextBreakTime?: number;

    /**
     * Whether the item is currently broken.
     */
    isBroken?: boolean;

    /**
     * Timestamp (server time) when the current breakdown began.
     */
    brokenAt?: number;

    /**
     * Timestamp when the item was last successfully repaired.
     */
    lastRepairTime?: number;

    /**
     * Total number of times this item has broken.
     */
    breakdownCount?: number;
}

export interface RepairMiniGameConfig {
    /** Placement ID of the item to repair. */
    placementId: string;
    /** Server timestamp when the mini-game started. */
    startTimestamp: number;
    /** Beginning of the success window (0-1). */
    targetStart: number;
    /** End of the success window (0-1). */
    targetEnd: number;
    /** Cycles per second of the indicator. */
    speed: number;
}

export interface ItemBreakEventPayload {
    itemId: string;
    config: RepairMiniGameConfig;
}

const rng = new Random();

export function getRandomBreakInterval(): number {
    const [min, max] = BREAK_INTERVAL_RANGE;
    return rng.NextNumber(min, max);
}

export function ensureBreakdownState(placedItem: PlacedItem) {
    placedItem.meta = placedItem.meta ?? {};
    placedItem.meta.breakdown = placedItem.meta.breakdown ?? {};
    return placedItem.meta.breakdown;
}

export function getServerTimestamp(): number {
    return Workspace.GetServerTimeNow();
}

export function createMiniGameConfig(placementId: string): RepairMiniGameConfig {
    const startTimestamp = getServerTimestamp();
    const base = rng.NextNumber(0, 1 - REPAIR_TARGET_WIDTH);
    const targetStart = math.clamp(base, 0.05, 1 - REPAIR_TARGET_WIDTH - 0.05);
    const targetEnd = targetStart + REPAIR_TARGET_WIDTH;
    return {
        placementId,
        startTimestamp,
        targetStart,
        targetEnd,
        speed: REPAIR_INDICATOR_SPEED,
    };
}

export function computeMiniGameProgress(config: RepairMiniGameConfig, timestamp = getServerTimestamp()): number {
    const elapsed = math.max(0, timestamp - config.startTimestamp);
    return (elapsed * config.speed) % 1;
}

export function isWithinTarget(config: RepairMiniGameConfig, progress: number): boolean {
    if (progress < config.targetStart - REPAIR_LATENCY_TOLERANCE) return false;
    if (progress > config.targetEnd + REPAIR_LATENCY_TOLERANCE) return false;
    return true;
}
