//!native
//!optimize 2

import { getAllInstanceInfo, simpleInterval } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import Packets from "shared/Packets";
import eat from "shared/hamster/eat";
import {
    computeMiniGameProgress,
    createMiniGameConfig,
    ensureBreakdownState,
    getRandomBreakInterval,
    getServerTimestamp,
    isWithinTarget,
    ItemBreakdownState,
    ItemBreakEventPayload,
    RepairMiniGameConfig,
} from "shared/item/ItemBreakdown";

declare global {
    interface PlacedItemMetadata {
        breakdown?: ItemBreakdownState;
    }
}

/**
 * Manages automatic item breakdowns and repair interactions.
 */
@Service()
export default class ItemBreakdownService implements OnInit, OnStart {
    private readonly miniGamePerPlacement = new Map<string, RepairMiniGameConfig>();
    private readonly placedItems: Map<string, PlacedItem>;

    constructor(
        private readonly dataService: DataService,
        private readonly itemService: ItemService,
    ) {
        this.placedItems = this.dataService.empireData.items.worldPlaced;
    }

    onInit() {
        Packets.repairItem.fromClient((player, placementId) => {
            if (player === undefined) return false;
            return this.handleRepairAttempt(placementId);
        });

        const placedConnection = this.itemService.itemsPlaced.connect((_, placedItems: IdPlacedItem[]) => {
            for (const placedItem of placedItems) {
                this.initializeBreakdownState(placedItem.id, placedItem);
            }
            this.itemService.markPlacedItemsDirty();
        });
        eat(placedConnection, "Disconnect");
    }

    onStart() {
        let markDirty = false;
        for (const [placementId, placedItem] of this.placedItems) {
            const didMutate = this.initializeBreakdownState(placementId, placedItem);
            if (didMutate) markDirty = true;
        }
        if (markDirty) {
            this.itemService.markPlacedItemsDirty();
        }

        eat(simpleInterval(() => this.tick(), 1.5));
    }

    /** Command hook: breaks all placed items immediately. */
    forceBreakAllItems() {
        let count = 0;
        for (const [placementId, placedItem] of this.placedItems) {
            if (this.beginBreakdown(placementId, placedItem)) {
                count++;
            }
        }
        if (count > 0) {
            this.itemService.markPlacedItemsDirty();
        }
        return count;
    }

    private tick() {
        const now = getServerTimestamp();

        let mutated = false;

        for (const [placementId] of this.miniGamePerPlacement) {
            if (!this.placedItems.has(placementId)) {
                this.miniGamePerPlacement.delete(placementId);
            }
        }

        for (const [placementId, placedItem] of this.placedItems) {
            const state = ensureBreakdownState(placedItem);
            if (state.isBroken === true) continue;
            const nextBreak = state.nextBreakTime;
            if (nextBreak !== undefined && now >= nextBreak) {
                if (this.beginBreakdown(placementId, placedItem)) {
                    mutated = true;
                }
            }
        }

        if (mutated) {
            this.itemService.markPlacedItemsDirty();
        }
    }

    private handleRepairAttempt(placementId: string) {
        const placedItem = this.placedItems.get(placementId);
        if (!placedItem) return false;

        const state = ensureBreakdownState(placedItem);
        if (state.isBroken !== true) return false;

        const config = this.miniGamePerPlacement.get(placementId);
        if (config === undefined) {
            // Recreate the mini-game if it somehow disappeared
            this.beginBreakdown(placementId, placedItem);
            return false;
        }

        const progress = computeMiniGameProgress(config);
        if (!isWithinTarget(config, progress)) {
            return false;
        }

        this.completeRepair(placementId, placedItem, state);
        return true;
    }

    private completeRepair(placementId: string, placedItem: PlacedItem, state: ItemBreakdownState) {
        const now = getServerTimestamp();
        state.isBroken = false;
        state.brokenAt = undefined;
        state.lastRepairTime = now;
        state.nextBreakTime = now + getRandomBreakInterval();
        placedItem.meta = placedItem.meta ?? {};
        placedItem.meta.breakdown = state;

        const model = this.itemService.modelPerPlacementId.get(placementId);
        if (model) {
            const info = getAllInstanceInfo(model);
            info.Broken = false;
        }

        this.clearActiveMiniGame(placementId);
        this.itemService.markPlacedItemsDirty();
        Packets.itemRepairCompleted.toAllClients(placementId);
    }

    private beginBreakdown(placementId: string, placedItem: PlacedItem) {
        const state = ensureBreakdownState(placedItem);
        print(state);
        if (state.isBroken === true && this.miniGamePerPlacement.has(placementId)) {
            return false;
        }

        state.isBroken = true;
        state.brokenAt = getServerTimestamp();
        state.breakdownCount = (state.breakdownCount ?? 0) + 1;
        state.nextBreakTime = undefined;

        const model = this.itemService.modelPerPlacementId.get(placementId);
        if (model) {
            const info = getAllInstanceInfo(model);
            info.Broken = true;
        }

        const config = createMiniGameConfig(placementId);
        const payload: ItemBreakEventPayload = {
            itemId: placedItem.item,
            config,
        };
        this.miniGamePerPlacement.set(placementId, config);
        Packets.itemBreakTriggered.toAllClients(payload);
        return true;
    }

    private initializeBreakdownState(placementId: string, placedItem: PlacedItem) {
        placedItem.meta = placedItem.meta ?? {};
        let state = placedItem.meta.breakdown;
        let mutated = false;

        if (state === undefined) {
            state = {};
            mutated = true;
        }

        const ensured = ensureBreakdownState(placedItem);
        const now = getServerTimestamp();

        if (ensured.isBroken === true) {
            this.beginBreakdown(placementId, placedItem);
            mutated = true;
        } else if (ensured.nextBreakTime === undefined || ensured.nextBreakTime <= now) {
            ensured.nextBreakTime = now + getRandomBreakInterval();
            mutated = true;
        }

        placedItem.meta.breakdown = ensured;
        return mutated;
    }
    private clearActiveMiniGame(placementId: string) {
        this.miniGamePerPlacement.delete(placementId);
    }
}
