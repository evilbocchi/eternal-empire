//!native
//!optimize 2

import { Controller, OnInit, OnStart } from "@flamework/core";
import AdaptiveTabController, { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/interface/AdaptiveTabController";
import BuildController from "client/controllers/BuildController";
import TooltipController, { Tooltip } from "client/controllers/interface/TooltipController";
import UIController, { INTERFACE } from "client/controllers/UIController";
import ItemFilter from "client/ItemFilter";
import ItemSlot from "client/ItemSlot";
import { ASSETS } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";


export const INVENTORY_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Inventory") as Frame & {
    Empty: Frame;
    Page: ItemListContainer & {
        FilterOptions: FilterOptions;
    };
};

const sortedItemsSize = Items.sortedItems.size();
const reverseSortedItems = new Array<Item>(sortedItemsSize);
for (let i = 0; i < sortedItemsSize; i++) {
    reverseSortedItems[i] = Items.sortedItems[sortedItemsSize - 1 - i];
}

@Controller()
export default class InventoryController implements OnInit, OnStart {

    readonly itemSlotsPerItem = new Map<Item, ItemSlot>();
    readonly items = new Array<Item>();

    readonly filterItems = ItemFilter.loadFilterOptions(INVENTORY_WINDOW.Page.FilterOptions, (query, whitelistedTraits) => {
        ItemSlot.filterItems(this.itemSlotsPerItem, this.items, query, whitelistedTraits);
    });


    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, private tooltipController: TooltipController) {

    }

    /**
     * Find the best unique item instance for a given base item ID based on its average pot.
     * 
     * @param baseItemId The ID of the base item to find the best unique instance for.
     * @returns The best unique item instance, or undefined if no instances found.
     */
    getBest(baseItemId: string) {
        // Find the best unique item instance for the given base item ID
        let bestUuid: string | undefined;
        let bestInstance: UniqueItemInstance | undefined;
        const uniqueInstances = Packets.uniqueInstances.get();
        if (uniqueInstances === undefined) {
            return undefined;
        }
        for (const [uuid, instance] of uniqueInstances) {
            if (instance.placed)
                continue; // Skip placed instances
            if (instance.baseItemId === baseItemId) {
                let thisPots = 0;
                for (const [_, potValue] of instance.pots) {
                    thisPots += potValue;
                }

                let otherPots = 0;
                if (bestInstance) {
                    for (const [_, potValue] of bestInstance.pots) {
                        otherPots += potValue;
                    }
                }

                if (thisPots > otherPots) {
                    bestInstance = instance;
                    bestUuid = uuid;
                }
            }
        }
        return bestUuid;
    }

    refreshInventoryWindow(inventory = Packets.inventory.get(), uniqueInstances = Packets.uniqueInstances.get()) {
        let isEmpty = true;
        const items = this.items;
        items.clear();
        const amounts = new Map<string, number>();
        if (uniqueInstances !== undefined) {
            for (const [_, uniqueInstance] of uniqueInstances) {
                const itemId = uniqueInstance.baseItemId;
                if (itemId === undefined || uniqueInstance.placed)
                    continue;

                const amount = amounts.get(itemId) ?? 0;
                amounts.set(itemId, amount + 1);
            }
        }


        for (const item of reverseSortedItems) {
            const itemSlot = this.itemSlotsPerItem.get(item);
            if (itemSlot === undefined)
                continue;

            const itemId = item.id;
            let amount = inventory.get(itemId) ?? 0;
            const uniques = amounts.get(itemId);
            if (uniques !== undefined) {
                amount += uniques;
            }

            const hasItem = amount > 0;
            if (hasItem) {
                isEmpty = false;
                items.push(item);
            }
            if (Items.uniqueItems.has(item)) {
                const bestUuid = this.getBest(itemId);
                this.tooltipController.getTooltip(itemSlot).uuid = bestUuid;
            }

            itemSlot.AmountLabel.Text = tostring(amount);
            itemSlot.AmountLabel.TextColor3 = hasItem ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);
        }

        INVENTORY_WINDOW.Empty.Visible = isEmpty;
        this.filterItems();
    }

    recalibrate() {
        const itemList = INVENTORY_WINDOW.Page.ItemList;
        itemList.UIGridLayout.CellSize = new UDim2(1 / ItemSlot.calculateOptimalCellCount(itemList.AbsoluteSize.X), -12, 1, 0);
    }

    loadItemSlots() {
        for (const [_id, item] of Items.itemsPerId) {
            if (item.isA("HarvestingTool"))
                continue;

            const itemSlot = ItemSlot.loadItemSlot(ASSETS.ItemListContainer.ItemSlot.Clone(), item);
            itemSlot.LayoutOrder = -item.layoutOrder;
            itemSlot.Visible = false;

            itemSlot.Activated.Connect(() => {
                const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
                if (this.buildController.getRestricted() === true || isPlaceable === false || (item.levelReq !== undefined && item.levelReq > Packets.level.get())) {
                    this.uiController.playSound("Error.mp3");
                    return;
                }
                this.adaptiveTabController.hideAdaptiveTab();
                this.uiController.playSound("MenuClick.mp3");
                let bestUuid: string | undefined;
                if (Items.uniqueItems.has(item)) {
                    bestUuid = this.getBest(item.id);
                }

                this.buildController.mainSelect(this.buildController.addPlacingModel(item, bestUuid));
            });

            this.tooltipController.setTooltip(itemSlot, Tooltip.fromItem(item));

            itemSlot.Parent = INVENTORY_WINDOW.Page.ItemList;
            this.itemSlotsPerItem.set(item, itemSlot);
        }

    }


    onInit() {
        this.loadItemSlots();

        INTERFACE.GetPropertyChangedSignal("AbsoluteSize").Connect(() => this.recalibrate());

        for (const traitOption of INVENTORY_WINDOW.Page.FilterOptions.TraitOptions.GetChildren()) {
            if (traitOption.IsA("GuiButton")) {
                this.tooltipController.setTooltip(traitOption, Tooltip.fromMessage(traitOption.Name));
            }
        }
    }

    onStart() {
        Packets.inventory.observe((inventory) => {
            this.refreshInventoryWindow(inventory);
        });
        Packets.uniqueInstances.observe((uniqueInstances) => {
            this.refreshInventoryWindow(undefined, uniqueInstances);
        });

        let firstLoad = true;
        const connection = INVENTORY_WINDOW.GetPropertyChangedSignal("Visible").Connect(() => {
            if (!firstLoad) {
                connection.Disconnect();
                return;
            }

            firstLoad = false;
            this.recalibrate();
            connection.Disconnect();
        });
    }
}