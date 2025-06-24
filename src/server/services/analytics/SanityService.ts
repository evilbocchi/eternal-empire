import Difficulty from "@antivivi/jjt-difficulties";
import { OnStart, Service } from "@flamework/core";
import Harvestable from "shared/Harvestable";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

/**
 * Ensures that game content is logical and consistent.
 */
@Service()
export class SanityService implements OnStart {

    checkItem(item: Item) {
        const shop = item.findTrait("Shop");
        if (shop !== undefined) {
            let isCrafting = false;
            for (const item of shop.items) {
                if (item.difficulty === Difficulty.Miscellaneous) {
                    isCrafting = true;
                    break;
                }
            }

            if (isCrafting) {
                for (const item of shop.items) {
                    const resetLayer = item.getResetLayer();
                    if (resetLayer < 100) {
                        warn(`Item ${item.name} (${item.id}) has a reset layer of ${resetLayer}. This is likely a mistake as this is a crafting item and should persist.`);
                    }
                }
            }
        }

        const a = item.getResetLayer();
        for (const [requiredItem, _] of item.requiredItems) {
            const b = requiredItem.getResetLayer();
            if (a !== b && a < 100 && b < 100) {
                warn(`Item ${item.name} (${item.id}) has a required item ${requiredItem.name} (${requiredItem.id}) with a different reset layer (${a} vs ${b}). This is likely a mistake.`);
            }
        }

        const model = item.MODEL;
        if (model === undefined) {
            warn(`Item ${item.name} (${item.id}) has no model. This is likely a mistake.`);
            return;
        }

        if (model.PrimaryPart === undefined) {
            warn(`Item ${item.name} (${item.id}) has no PrimaryPart set. This is likely a mistake.`);
            return;
        }
    }

    checkHarvestable(harvestableId: string) {
        const harvestable = Harvestable[harvestableId];
        if (harvestable === undefined) {
            return;
        }

        const item = Items.getItem(harvestableId);

        if (item === undefined) {
            return;
        }

        let craftables = 0;
        for (const [_, craftable] of Items.itemsPerId) {
            if (craftable.requiredItems.has(item)) {
                craftables += 1;
            }
        }
        if (craftables < 5) {
            warn(`Harvestable ${harvestable.name} (${harvestableId}) only has ${craftables} craftables (<5), consider adding more.`);
        }
    }

    onStart() {
        for (const [_, item] of Items.itemsPerId) {
            this.checkItem(item);
        }

        for (const [id] of pairs(Harvestable)) {
            this.checkHarvestable(id as string);
        }
    }
}