//!native
//!optimize 2

import { getAllInstanceInfo, variableInterval } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

const rng = new Random();

/**
 * Manages automatic item breakdowns and repair interactions.
 */
@Service()
export default class ItemBreakdownService implements OnInit, OnStart {
    private readonly placedItems: Map<string, PlacedItem>;
    private readonly brokenPlacedItems: Set<string>;

    constructor(
        private readonly dataService: DataService,
        private readonly itemService: ItemService,
    ) {
        this.placedItems = this.dataService.empireData.items.worldPlaced;
        this.brokenPlacedItems = this.dataService.empireData.items.brokenPlacedItems;
    }

    onInit() {
        const connection = this.itemService.itemModelAdded.connect((placementId, model, modelInfo) => {
            if (this.brokenPlacedItems.has(placementId)) {
                modelInfo.Broken = true;
            }
        });
        eat(connection, "Disconnect");

        Packets.repairItem.fromClient((player, placementId) => {
            if (player === undefined) return false;
            return false; // TODO
        });
    }

    onStart() {
        // Periodically check for items to break down
        const ref = { interval: 10 };
        const cleanup = variableInterval(() => {
            let changed = false;
            for (const [placementId] of this.placedItems) {
                if (this.brokenPlacedItems.has(placementId)) continue;

                if (rng.NextNumber() > 0.95) {
                    changed = true;
                    this.beginBreakdown(placementId);
                }
            }
            if (changed) {
                Packets.brokenPlacedItems.set(this.brokenPlacedItems);
            }
            ref.interval = 10 + rng.NextNumber() * 15;
        }, ref);
        eat(cleanup);
    }

    /** Command hook: breaks all placed items immediately. */
    forceBreakAllItems() {
        let count = 0;
        for (const [placementId] of this.placedItems) {
            if (this.beginBreakdown(placementId)) {
                count++;
            }
        }
        Packets.brokenPlacedItems.set(this.brokenPlacedItems);
        return count;
    }

    private completeRepair(placementId: string) {
        this.brokenPlacedItems.delete(placementId);

        const model = this.itemService.modelPerPlacementId.get(placementId);
        if (model) {
            const info = getAllInstanceInfo(model);
            info.Broken = false;
        }

        Packets.itemRepairCompleted.toAllClients(placementId);
    }

    private beginBreakdown(placementId: string) {
        if (this.brokenPlacedItems.has(placementId)) {
            return false;
        }

        const model = this.itemService.modelPerPlacementId.get(placementId);
        if (model) {
            const info = getAllInstanceInfo(model);
            info.Broken = true;
        }
        this.brokenPlacedItems.add(placementId);
        return true;
    }
}
