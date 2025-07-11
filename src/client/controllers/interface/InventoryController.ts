import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { INTERFACE, INVENTORY_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import { AREAS, DifficultyOption, ItemSlot } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";

@Controller()
export class InventoryController implements OnInit, OnStart {

    tooltipsPerItem = new Map<string, string>();
    itemSlotsPerItem = new Map<Item, ItemSlot>();
    difficultyOptionsPerItem = new Map<Item, DifficultyOption>();
    coalescedOption!: DifficultyOption;
    coalesce = false;

    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private buildController: BuildController,
        private itemSlotController: ItemSlotController, private tooltipController: TooltipController) {

    }

    refreshInventoryWindow(inventory: Inventory) {
        let isEmpty = true;
        const visibilityPerDifficultyOption = new Map<DifficultyOption, boolean>();
        for (const [item, difficultyOption] of this.difficultyOptionsPerItem) {
            const itemId = item.id;
            const amount = inventory.get(itemId);
            const hasItem = amount !== undefined && amount > 0;

            if (item.layoutOrder !== undefined && this.coalesce === true) {
                isEmpty = false;
                visibilityPerDifficultyOption.set(difficultyOption, false);
            }
            else {
                if (hasItem === true) {
                    isEmpty = false;
                    visibilityPerDifficultyOption.set(difficultyOption, true);
                }
                else if (visibilityPerDifficultyOption.has(difficultyOption) === false) {
                    visibilityPerDifficultyOption.set(difficultyOption, false);
                }
            }

            const itemSlot = this.itemSlotsPerItem.get(item);
            if (itemSlot !== undefined) {
                itemSlot.AmountLabel.Text = tostring(amount);
                itemSlot.AmountLabel.TextColor3 = hasItem ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);
                itemSlot.Visible = hasItem ? true : false;
            }
        }
        INVENTORY_WINDOW.Empty.Visible = isEmpty;
        task.spawn(() => {
            for (const [difficultyOption, visibility] of visibilityPerDifficultyOption)
                difficultyOption.Visible = visibility;
        });
    }

    onInit() {
        this.coalescedOption = this.itemSlotController.getDifficultyOption(Difficulty.Main);
        this.coalescedOption.Visible = false;
        this.coalescedOption.Parent = INVENTORY_WINDOW.ItemList;
    }

    onStart() {
        const updateTooltip = (item: Item, itemSlot: ItemSlot, multiplier: OnoeNum | undefined) => {
            this.tooltipController.setTooltip(itemSlot, this.itemSlotController.formatMetadata(item, this.tooltipsPerItem.get(item.id)!, 16, "Bold", multiplier));
        };

        let calibrated: UDim2 | undefined = undefined;
        const recalibrate = (difficultyOption: DifficultyOption) => {
            calibrated = new UDim2(1 / this.itemSlotController.calculateOptimalCellCount(difficultyOption.Items.AbsoluteSize.X), -12, 1, 0);
            return calibrated;
        };
        const hasLevelReqs = new Map<Item, ItemSlot>();
        for (const [id, item] of Items.itemsPerId) {
            if (item.isA("HarvestingTool"))
                continue;
            const itemSlot = this.itemSlotController.getItemSlot(item);
            const difficulty = item.difficulty!;
            itemSlot.LayoutOrder = -(item.layoutOrder ?? -100000);
            itemSlot.Activated.Connect(() => {
                const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
                if (this.buildController.restricted === true || isPlaceable === false || (item.levelReq !== undefined && item.levelReq > Packets.level.get())) {
                    this.uiController.playSound("Error");
                    return;
                }
                this.adaptiveTabController.hideAdaptiveTab();
                this.uiController.playSound("Click");
                this.buildController.placeNewItem(item);
            });
            itemSlot.Visible = false;
            this.tooltipsPerItem.set(id, this.tooltipController.tooltipsPerObject.get(itemSlot)!);
            updateTooltip(item, itemSlot, undefined);
            let difficultyOption = INVENTORY_WINDOW.ItemList.FindFirstChild(difficulty.id) as DifficultyOption | undefined;
            if (difficultyOption === undefined) {
                difficultyOption = this.itemSlotController.getDifficultyOption(difficulty);
                difficultyOption.LayoutOrder = -difficultyOption.LayoutOrder;
                difficultyOption.Visible = false;
                difficultyOption.Parent = INVENTORY_WINDOW.ItemList;
                if (calibrated === undefined)
                    recalibrate(difficultyOption);
                difficultyOption.Items.UIGridLayout.CellSize = calibrated!;
            }
            this.difficultyOptionsPerItem.set(item, difficultyOption);
            itemSlot.Parent = difficultyOption.WaitForChild("Items");
            this.itemSlotsPerItem.set(item, itemSlot);
            if (item.levelReq !== undefined)
                hasLevelReqs.set(item, itemSlot);
        }

        Packets.settings.observe((settings) => {
            if (settings.CoalesceItemCategories === this.coalesce)
                return;
            this.coalesce = settings.CoalesceItemCategories;
            this.coalescedOption.Visible = this.coalesce;
            let recalibrated = this.coalesce;
            if (this.coalesce === true)
                this.coalescedOption.Items.UIGridLayout.CellSize = recalibrate(this.coalescedOption);
            for (const [item, slot] of this.itemSlotsPerItem) {
                const diffOption = this.difficultyOptionsPerItem.get(item);
                if (recalibrated === false) {
                    recalibrated = true;
                    this.coalescedOption.Items.UIGridLayout.CellSize = recalibrate(diffOption!);
                }
                slot.Parent = this.coalesce && item.layoutOrder !== undefined ? this.coalescedOption.Items : diffOption?.Items;
            }
            this.refreshInventoryWindow(Packets.inventory.get());
        });
        Packets.inventory.observe((inventory) => this.refreshInventoryWindow(inventory));
        Packets.boostChanged.connect((value) => {
            for (const [itemId, amount] of value) {
                const item = Items.getItem(itemId)!;
                updateTooltip(item, this.itemSlotsPerItem.get(item)!, new OnoeNum(amount));
            }
        });
        AREAS.SlamoVillage.unlocked.Changed.Connect(() => {
            for (const [id, item] of Items.itemsPerId) {
                updateTooltip(item, this.itemSlotsPerItem.get(item)!, undefined);
            }
        });
        Packets.level.changed.connect(() => {
            for (const [item, itemSlot] of hasLevelReqs)
                updateTooltip(item, itemSlot, undefined);
        });
        INTERFACE.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
            let recalibrated = false;
            const difficultyOptions = INVENTORY_WINDOW.ItemList.GetChildren();
            for (const dO of difficultyOptions) {
                if (!dO.IsA("Frame"))
                    continue;
                const difficultyOption = dO as DifficultyOption;
                if (recalibrated === false) {
                    recalibrated = true;
                    recalibrate(difficultyOption);
                }
                difficultyOption.Items.UIGridLayout.CellSize = calibrated!;
            }
        });
    }
}