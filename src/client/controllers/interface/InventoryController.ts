import { Controller, OnInit } from "@flamework/core";
import { INVENTORY_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Difficulty from "shared/Difficulty";
import { AREAS, DifficultyOption, ItemSlot, ItemsData } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import { Fletchette } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class InventoryController implements OnInit {

    difficultyOptions = new Array<DifficultyOption>();
    tooltipsPerItem = new Map<string, string>();
    itemSlotsPerItem = new Map<string, ItemSlot>();
    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, 
        private itemSlotController: ItemSlotController, private tooltipController: TooltipController) {
        
    }

    getDifficultyOption(difficulty?: Difficulty) {
        return difficulty !== undefined ? INVENTORY_WINDOW.ItemList.WaitForChild(difficulty?.id) as DifficultyOption : undefined;
    }

    refreshInventoryWindow(items: ItemsData) {
        for (const difficultyOption of this.difficultyOptions) {
            difficultyOption.Visible = false;
        }
        for (const [_, itemSlot] of this.itemSlotsPerItem) {
            itemSlot.Visible = false;
        }
        let total = 0;
        for (const [itemId, amount] of items.inventory) {
            total += amount;
            task.spawn(() => {
                const difficultyOption = this.getDifficultyOption(Items.getItem(itemId)?.difficulty);
                if (difficultyOption === undefined) {
                    return;
                }
                const hasItem = amount > 0;
                const itemSlot = (difficultyOption.Items.FindFirstChild(itemId) as ItemSlot);
                if (itemSlot !== undefined) {
                    itemSlot.AmountLabel.Text = tostring(amount);
                    itemSlot.AmountLabel.TextColor3 = hasItem ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);
                    itemSlot.Visible = hasItem ? true : false;
                    if (hasItem)
                        difficultyOption.Visible = true;
                }
            });
        }
        INVENTORY_WINDOW.Empty.Visible = total === 0;
    }

    onInit() {
        for (const [_id, difficulty] of pairs(Difficulty.DIFFICULTIES)) {
            const difficultyOption = this.itemSlotController.getDifficultyOption(difficulty);
            difficultyOption.LayoutOrder = -difficultyOption.LayoutOrder;
            difficultyOption.Visible = false;
            difficultyOption.Parent = INVENTORY_WINDOW.ItemList;
            this.difficultyOptions.push(difficultyOption);
        }

        const updateTooltip = (item: Item, itemSlot: ItemSlot, multiplier: OnoeNum | undefined) => {
            let tooltip = this.tooltipsPerItem.get(item.id)!;
            const hasFormula = item.formula !== undefined;
            const hasSlamoVillage = AREAS.SlamoVillage.unlocked.Value === true;
            if (hasFormula || hasSlamoVillage) {
                tooltip += `\n<font size="7"> </font>`;
            }
            if (hasFormula)
                tooltip += `\n${this.itemSlotController.formatFormula(item, ItemsCanister.multiplierPerItem.get()?.get(item.id), 16, "Bold")}`;
            if (item.placeableAreas.isEmpty() || hasSlamoVillage)
                tooltip += `\n${this.itemSlotController.formatPlaceableAreas(item, 16, "Bold")}`;
            if (hasSlamoVillage)
                tooltip += `\n${this.itemSlotController.formatResettingAreas(item, 16, "Bold")}`;
            this.tooltipController.setTooltip(itemSlot, tooltip);
        }

        for (const [id, item] of Items.init()) {
            const [itemSlot, _v] = this.itemSlotController.getItemSlot(item);
            itemSlot.Activated.Connect(() => {
                if (this.buildController.restricted === true) {
                    return;
                }
                this.uiController.playSound("Click");
                this.adaptiveTabController.hideAdaptiveTab();
                this.buildController.placeNewItem(item);
            });
            itemSlot.Visible = false;
            this.tooltipsPerItem.set(id, this.tooltipController.tooltipsPerObject.get(itemSlot)!);
            updateTooltip(item, itemSlot, undefined);
            itemSlot.Parent = this.getDifficultyOption(item.difficulty)?.WaitForChild("Items");
            this.itemSlotsPerItem.set(id, itemSlot);
        }
        ItemsCanister.items.observe((items) => this.refreshInventoryWindow(items));
        ItemsCanister.multiplierPerItem.observe((value) => {
            for (const [itemId, amount] of value) {
                updateTooltip(Items.getItem(itemId)!, this.itemSlotsPerItem.get(itemId)!, amount);
            }
        });
        AREAS.SlamoVillage.unlocked.Changed.Connect(() => {
            for (const [id, item] of Items.init()) {
                updateTooltip(item, this.itemSlotsPerItem.get(id)!, undefined);
            }
        })
    }
}