import { Controller, OnInit } from "@flamework/core";
import { INVENTORY_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import Difficulty from "shared/Difficulty";
import { DifficultyOption, ItemSlot, ItemsData } from "shared/constants";
import Items from "shared/items/Items";
import { Fletchette } from "shared/utils/fletchette";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class InventoryController implements OnInit {

    difficultyOptions = new Array<DifficultyOption>();
    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, 
        private itemSlotController: ItemSlotController) {
        
    }

    getDifficultyOption(difficulty?: Difficulty) {
        return difficulty !== undefined ? INVENTORY_WINDOW.ItemList.WaitForChild(difficulty?.id) as DifficultyOption : undefined;
    }

    refreshInventoryWindow(items: ItemsData) {
        for (const difficultyOption of this.difficultyOptions) {
            if (difficultyOption.IsA("Frame"))
                difficultyOption.Visible = false;
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
        }
        for (const [_id, item] of Items.init()) {
            const [itemSlot, _v] = this.itemSlotController.getItemSlot(item);
            INVENTORY_WINDOW.GetPropertyChangedSignal("Visible").Connect(() => itemSlot.ViewportFrame.SetAttribute("Delta", INVENTORY_WINDOW.Visible ? 0.4 : 0));
            itemSlot.Activated.Connect(() => {
                if (this.buildController.restricted === true) {
                    return;
                }
                this.uiController.playSound("Click");
                this.adaptiveTabController.hideAdaptiveTab();
                this.buildController.placeNewItem(item);
            });
            itemSlot.Visible = false;
            itemSlot.Parent = this.getDifficultyOption(item.difficulty)?.WaitForChild("Items");
        }
        this.difficultyOptions = INVENTORY_WINDOW.ItemList.GetChildren() as DifficultyOption[];
        ItemsCanister.items.observe((items) => this.refreshInventoryWindow(items));
    }
}