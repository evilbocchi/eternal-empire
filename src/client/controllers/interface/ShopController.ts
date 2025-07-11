import { Controller, OnInit } from "@flamework/core";
import { ProximityPromptService, TweenService } from "@rbxts/services";
import { ADAPTIVE_TAB, LOCAL_PLAYER, SHOP_WINDOW } from "client/constants";
import Price from "shared/Price";
import Difficulty from "shared/difficulty/Difficulty";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import ItemCounter from "shared/utils/ItemCounter";
import { Fletchette } from "shared/utils/fletchette";
import { HotkeysController } from "../HotkeysController";
import { UIController } from "../UIController";
import { AdaptiveTabController } from "./AdaptiveTabController";
import { BuildController } from "./BuildController";
import { ItemSlotController } from "./ItemSlotController";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class ShopController implements OnInit {
    placementId = undefined as string | undefined;
    selected = undefined as Item | undefined;
    lastShop = undefined as string | undefined;

    constructor(private hotkeysController: HotkeysController, private uiController: UIController, 
        private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, 
        private itemSlotController: ItemSlotController) {
        
    }

    showShopWindow(itemId?: string, placementId?: string) {
        if (itemId !== undefined) {
            this.refreshShopWindow(itemId, placementId);
        }
        this.lastShop = itemId;
        this.adaptiveTabController.showAdaptiveTab("Shop");
    }

    refreshShopWindow(itemId: string, placementId?: string) {
        const item = Items.getItem(itemId);
        if (item === undefined || !item.isA("Shop")) {
            return;
        }
        if (placementId !== undefined) {
            this.placementId = placementId;
        }
        for (const a of SHOP_WINDOW.ItemList.GetChildren()) {
            if (a.IsA("Frame")) {
                a.Destroy();
            }
        }
        const difficulties = new Map<Difficulty, Item[]>();
        for (const i of item.getItems()) {
            const difficulty = i.getDifficulty();
            if (difficulty === undefined)
                continue;
            const difficultyItems = difficulties.get(difficulty) ?? [];
            difficultyItems.push(i);
            difficulties.set(difficulty, difficultyItems);
        }
        for (const [difficulty, difficultyItems] of difficulties) {
            const difficultyOption = this.itemSlotController.getDifficultyOption(difficulty);
            for (const difficultyItem of difficultyItems) {
                const [itemSlot, _v] = this.itemSlotController.getItemSlot(difficultyItem);
                itemSlot.Parent = difficultyOption.Items;
                task.spawn(() => {
                    const price = difficultyItem.getPrice((ItemsCanister.items.get().bought.get(difficultyItem.id) ?? 0) + 1);
                    if (price === undefined) {
                        itemSlot.AmountLabel.Text = "MAXED";
                        itemSlot.AmountLabel.TextColor3 = Color3.fromRGB(255, 156, 5);
                        return;
                    }
                    while (itemSlot !== undefined && itemSlot.Parent !== undefined) {
                        for (const [currency, cost] of price.costPerCurrency) {
                            if (itemSlot !== undefined && itemSlot.FindFirstChild("AmountLabel") !== undefined) {
                                itemSlot.AmountLabel.Text = price.tostring(currency, cost);
                                TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), { TextColor3: Price.DETAILS_PER_CURRENCY[currency].color }).Play();
                            }
                            task.wait(2);
                        }
                    }
                });
                itemSlot.Activated.Connect(() => {
                    this.uiController.playSound("Click");
                    this.showPurchaseWindow(difficultyItem);
                });
            }
            difficultyOption.Parent = SHOP_WINDOW.ItemList;
        }
    }

    showPurchaseWindow(item: Item) {
        const items = ItemsCanister.items.get();
        if (items === undefined) {
            return;
        }
        this.selected = item;
        SHOP_WINDOW.PurchaseWindow.Title.DifficultyLabel.Image = "rbxassetid://" + item.difficulty?.getImage();
        SHOP_WINDOW.PurchaseWindow.Title.ItemNameLabel.Text = (item.getName() ?? "error") + " (Owned: " + ItemCounter.getTotalAmount(items, item.id) + ")";
        SHOP_WINDOW.PurchaseWindow.ViewportFrame.ClearAllChildren();
        this.itemSlotController.loadViewportFrame(SHOP_WINDOW.PurchaseWindow.ViewportFrame, item);
        SHOP_WINDOW.PurchaseWindow.ItemInfo.DescriptionFrame.DescriptionLabel.Text = item.getDescription() ?? "<no description available>";
        const price = item.getPrice((items.bought.get(item.id) ?? 0) + 1);
        let label = price?.tostring();
        const requiredItems = item.getRequiredItems();
        if (requiredItems !== undefined && label !== undefined) {
            let i = 1;
            const size = requiredItems.size();
            for (const [required, amount] of requiredItems) {
                if (i === 1) {
                    label += ", ";
                }
                label += (amount + " " + required.getName());
                if (i < size) {
                    label += ", ";
                }
                i++
            }
        }
        SHOP_WINDOW.PurchaseWindow.ItemInfo.Purchase.PriceLabel.Text = "Price: " + (price === undefined ? "Unavailable" : label);
        let color = item.getDifficulty()?.getColor() ?? new Color3();
        color = new Color3(color.R + 0.2, color.G + 0.2, color.B + 0.2);
        SHOP_WINDOW.PurchaseWindow.ItemInfo.DescriptionFrame.Size = new UDim2(1, 0, 0.8, -SHOP_WINDOW.PurchaseWindow.ItemInfo.Purchase.AbsoluteSize.Y);
        SHOP_WINDOW.PurchaseWindow.Visible = true;
        SHOP_WINDOW.ItemList.Visible = false;
    }

    onInit() {
        SHOP_WINDOW.PurchaseWindow.Visible = false;
        const exitPurchase = () => {
            if (SHOP_WINDOW.Visible && SHOP_WINDOW.PurchaseWindow.Visible) {
                this.uiController.playSound("Click");
                SHOP_WINDOW.PurchaseWindow.Visible = false;
                SHOP_WINDOW.ItemList.Visible = true;
                return true;
            }
            return false;
        }
        ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            const s = prompt.GetAttribute("Shop") as string | undefined;
            if (player === LOCAL_PLAYER && !this.buildController.buildModeEnabled && s !== undefined) {
                this.uiController.playSound("Flip");
                this.showShopWindow(prompt.Name, s);
                exitPurchase();
            }
        });
        this.buildController.placedItemsFolder.ChildRemoved.Connect((child) => {
            if (child.Name === this.placementId) {
                this.adaptiveTabController.hideAdaptiveTab();
            }
        });
        ItemsCanister.items.observe(() => {
            if (ADAPTIVE_TAB.Visible !== true) {
                return;
            }
            else if (SHOP_WINDOW.Visible === true && this.lastShop !== undefined) {
                this.refreshShopWindow(this.lastShop);
                if (SHOP_WINDOW.PurchaseWindow.Visible && this.selected !== undefined) {
                    this.showPurchaseWindow(this.selected);
                }
            }
        });
        SHOP_WINDOW.PurchaseWindow.ItemInfo.Purchase.Activated.Connect(() => {
            if (this.selected !== undefined && ItemsCanister.buyItem.invoke(this.selected.id)) {
                this.uiController.playSound("Coins");
                return;
            }
            this.uiController.playSound("Error");
        });
        this.hotkeysController.setHotkey(ADAPTIVE_TAB.CloseButton, Enum.KeyCode.X, () => exitPurchase(), "Back", 2);
    }
}