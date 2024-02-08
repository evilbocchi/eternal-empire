import { Controller, OnInit } from "@flamework/core";
import { ProximityPromptService, TweenService } from "@rbxts/services";
import { ADAPTIVE_TAB, LOCAL_PLAYER, PURCHASE_WINDOW, SHOP_WINDOW } from "client/constants";
import Price from "shared/Price";
import Difficulty from "shared/difficulty/Difficulty";
import Item from "shared/item/Item";
import Items from "shared/item/Items";
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
                task.spawn(() => {
                    const price = difficultyItem.getPrice((ItemsCanister.items.get().bought.get(difficultyItem.id) ?? 0) + 1);
                    if (price === undefined) {
                        itemSlot.AmountLabel.Text = "MAXED";
                        itemSlot.AmountLabel.TextColor3 = Color3.fromRGB(255, 156, 5);
                        return;
                    }
                    while (task.wait()) {
                        for (const [currency, cost] of price.costPerCurrency) {
                            if (itemSlot !== undefined && itemSlot.FindFirstChild("AmountLabel") !== undefined) {
                                itemSlot.AmountLabel.Text = price.tostring(currency, cost);
                                TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), { TextColor3: Price.COLORS[currency] }).Play();
                            }
                            task.wait(2);
                        }
                    }
                });
                itemSlot.Activated.Connect(() => {
                    this.uiController.playSound("Click");
                    this.showPurchaseWindow(difficultyItem);
                });
                itemSlot.Parent = difficultyOption.Items;
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
        PURCHASE_WINDOW.Header.DifficultyLabel.Image = "rbxassetid://" + item.difficulty?.getImage();
        PURCHASE_WINDOW.Header.ItemNameLabel.Text = (item.getName() ?? "error") + " (Owned: " + ItemCounter.getTotalAmount(items, item.id) + ")";
        PURCHASE_WINDOW.Body.ViewportFrame.ClearAllChildren();
        this.itemSlotController.loadViewportFrame(PURCHASE_WINDOW.Body.ViewportFrame, item);
        PURCHASE_WINDOW.Body.ItemInfo.DescriptionLabel.Text = item.getDescription() ?? "<no description available>";
        const price = item.getPrice((items.bought.get(item.id) ?? 0) + 1);
        PURCHASE_WINDOW.Body.ItemInfo.Options.Purchase.PriceLabel.Text = "Price: " + (price === undefined ? "Unavailable" : price.tostring());
        this.adaptiveTabController.showAdaptiveTab("Purchase");
    }

    onInit() {
        ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            const s = prompt.GetAttribute("Shop") as string | undefined;
            if (player === LOCAL_PLAYER && !this.buildController.buildModeEnabled && s !== undefined) {
                this.uiController.playSound("Flip");
                this.showShopWindow(prompt.Name, s);
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
            if (this.selected !== undefined && PURCHASE_WINDOW.Visible === true) {
                this.showPurchaseWindow(this.selected);
            }
            else if (SHOP_WINDOW.Visible === true && this.lastShop !== undefined) {
                this.refreshShopWindow(this.lastShop);
            }
        });
        PURCHASE_WINDOW.Body.ItemInfo.Options.Purchase.Activated.Connect(() => {
            if (this.selected !== undefined && ItemsCanister.buyItem.invoke(this.selected.id)) {
                this.uiController.playSound("Coins");
                return;
            }
            this.uiController.playSound("Error");
        });
        const exitPurchase = () => {
            if (PURCHASE_WINDOW.Visible) {
                this.uiController.playSound("Click");
                this.showShopWindow(this.lastShop);
                return true;
            }
            return false;
        }
        PURCHASE_WINDOW.Body.ItemInfo.Options.Back.Activated.Connect(() => exitPurchase());
        this.hotkeysController.setHotkey(PURCHASE_WINDOW.Body.ItemInfo.Options.Back, Enum.KeyCode.X, () => exitPurchase(), "Back", 2);
    }
}