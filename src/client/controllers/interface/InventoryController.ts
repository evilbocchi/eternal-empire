import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { INVENTORY_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import { DifficultyOption, ItemSlot, ItemsData } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Difficulty from "shared/difficulty/Difficulty";
import Items from "shared/item/Items";
import { Fletchette } from "shared/utils/fletchette";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class InventoryController implements OnInit {

    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, 
        private itemSlotController: ItemSlotController) {
        
    }

    getDifficultyOption(difficulty?: Difficulty) {
        return INVENTORY_WINDOW.ItemList.WaitForChild(difficulty?.id ?? "error") as DifficultyOption;
    }

    refreshInventoryWindow(items: ItemsData) {
        for (const difficultyOption of INVENTORY_WINDOW.ItemList.GetChildren()) {
            if (difficultyOption.IsA("Frame"))
                difficultyOption.Visible = false;
        }
        for (const [itemId, amount] of items.inventory) {
            task.spawn(() => {
                const difficultyOption = this.getDifficultyOption(Items.getItem(itemId)?.getDifficulty());
                const hasItem = amount > 0;
                const itemSlot = (difficultyOption.Items.WaitForChild(itemId) as ItemSlot);
                itemSlot.AmountLabel.Text = tostring(amount);
                TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), { TextColor3: hasItem ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150) }).Play();
                itemSlot.Visible = hasItem ? true : false;
                if (hasItem)
                    difficultyOption.Visible = true;
            });
        }
    }

    onInit() {
        for (const difficulty of Difficulties.DIFFICULTIES) {
            const difficultyOption = this.itemSlotController.getDifficultyOption(difficulty);
            difficultyOption.LayoutOrder = -difficultyOption.LayoutOrder;
            difficultyOption.Visible = false;
            difficultyOption.Parent = INVENTORY_WINDOW.ItemList;
        }
        for (const item of Items.ITEMS) {
            const [itemSlot, _v] = this.itemSlotController.getItemSlot(item);
            itemSlot.Activated.Connect(() => {
                this.uiController.playSound("Click");
                this.adaptiveTabController.hideAdaptiveTab();
                this.buildController.placeNewItem(item);
            });
            itemSlot.Visible = false;
            itemSlot.Parent = this.getDifficultyOption(item.getDifficulty()).WaitForChild("Items");
        }
        ItemsCanister.items.observe((items) => this.refreshInventoryWindow(items));
    }
}