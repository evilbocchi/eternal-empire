//!native
//!optimize 2

import { Controller, OnInit, OnStart } from "@flamework/core";
import { ADAPTIVE_TAB_MAIN_WINDOW, AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { Tooltip, TooltipController } from "client/controllers/interface/TooltipController";
import { INTERFACE, UIController } from "client/controllers/UIController";
import ItemFilter from "client/ItemFilter";
import ItemSlot from "client/ItemSlot";
import { ASSETS } from "shared/GameAssets";
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
export class InventoryController implements OnInit, OnStart {

    readonly itemSlotsPerItem = new Map<Item, ItemSlot>();
    readonly items = new Array<Item>();

    readonly filterItems = ItemFilter.loadFilterOptions(INVENTORY_WINDOW.Page.FilterOptions, (query, whitelistedTraits) => {
        ItemSlot.filterItems(this.itemSlotsPerItem, this.items, query, whitelistedTraits);
    });


    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, private tooltipController: TooltipController) {

    }

    refreshInventoryWindow(inventory = Packets.inventory.get()) {
        let isEmpty = true;
        const items = this.items;
        items.clear();
        for (const item of reverseSortedItems) {
            const itemSlot = this.itemSlotsPerItem.get(item);
            if (itemSlot === undefined)
                continue;

            const itemId = item.id;
            const amount = inventory.get(itemId);
            const hasItem = amount !== undefined && amount > 0;
            if (hasItem) {
                isEmpty = false;
                items.push(item);
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
                    this.uiController.playSound("Error");
                    return;
                }
                this.adaptiveTabController.hideAdaptiveTab();
                this.uiController.playSound("Click");
                this.buildController.mainSelect(this.buildController.addPlacingModel(item));
            });

            this.tooltipController.setTooltip(itemSlot, Tooltip.fromItem(item));

            itemSlot.Parent = INVENTORY_WINDOW.Page.ItemList;
            this.itemSlotsPerItem.set(item, itemSlot);
        }

    }

    onInit() {
        this.loadItemSlots();

        Packets.inventory.observe((inventory) => this.refreshInventoryWindow(inventory));
        INTERFACE.GetPropertyChangedSignal("AbsoluteSize").Connect(() => this.recalibrate());

        for (const traitOption of INVENTORY_WINDOW.Page.FilterOptions.TraitOptions.GetChildren()) {
            if (traitOption.IsA("GuiButton")) {
                this.tooltipController.setTooltip(traitOption, Tooltip.fromMessage(traitOption.Name));
            }
        }
    }

    onStart() {
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