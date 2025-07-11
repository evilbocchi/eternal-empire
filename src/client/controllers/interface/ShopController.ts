import { Controller, OnInit } from "@flamework/core";
import { ProximityPromptService, RunService, TweenService } from "@rbxts/services";
import { LOCAL_PLAYER, SHOP_WINDOW } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { DifficultyOption, ItemSlot, PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Shop from "shared/item/Shop";
import Items from "shared/items/Items";
import ItemCounter from "shared/utils/ItemCounter";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { combineHumanReadable } from "shared/utils/vrldk/StringUtils";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class ShopController implements OnInit {
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

    difficultyOptions = new Array<DifficultyOption>();
    placementId = undefined as string | undefined;
    selected = undefined as Item | undefined;
    lastShop = undefined as string | undefined;

    constructor(private hotkeysController: HotkeysController, private uiController: UIController, 
        private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, 
        private itemSlotController: ItemSlotController) {
        
    }

    showShopWindow(item?: Shop, placementId?: string) {
        if (item !== undefined) {
            this.refreshShopWindow(item, placementId);
        }
        this.buildController.hideBuildWindow();
        this.lastShop = item?.id;
        SHOP_WINDOW.Active = true;
        if (!SHOP_WINDOW.Visible)
            SHOP_WINDOW.Position = new UDim2(0.06, 52, 1.5, -15);

        SHOP_WINDOW.Visible = true;
        TweenService.Create(SHOP_WINDOW, this.tween, {Position: new UDim2(0.06, 52, 0.5, -15)}).Play();
    }

    hideShopWindow() {
        if (SHOP_WINDOW.Visible === false) {
            return false;
        }
        this.buildController.showBuildWindow();
        SHOP_WINDOW.Active = false;
        const tween = TweenService.Create(SHOP_WINDOW, this.tween, {Position: new UDim2(0.06, 52, 1.5, -15)});
        tween.Play();
        tween.Completed.Once((playbackState) => {
            if (playbackState === Enum.PlaybackState.Completed)
                SHOP_WINDOW.Visible = false;
        });
        return true;
    }

    refreshShopWindow(item: Shop, placementId?: string) {
        if (placementId !== undefined) {
            this.placementId = placementId;
        }
        if (this.selected === undefined || !item.items.includes(this.selected)) {
            this.showPurchaseWindow(item.items[0]);
        }
        for (const difficultyOption of this.difficultyOptions) {
            if (difficultyOption.IsA("Frame"))
                difficultyOption.Visible = false;
        }
        const difficulties = new Map<Difficulty, Item[]>();
        for (const i of item.items) {
            const difficulty = i.difficulty;
            if (difficulty === undefined)
                continue;
            const difficultyItems = difficulties.get(difficulty) ?? [];
            difficultyItems.push(i);
            difficulties.set(difficulty, difficultyItems);
        }
        for (const [difficulty, difficultyItems] of difficulties) {
            const difficultyOption = SHOP_WINDOW.ItemListWrapper.ItemList.FindFirstChild(difficulty.id) as DifficultyOption;
            if (difficultyOption === undefined) {
                error("How did this happen?");
            }
            for (const is of difficultyOption.Items.GetChildren()) {
                if (is.Name === "UIGridLayout")
                    continue;
                const itemSlot = is as ItemSlot;
                const item = Items.getItem(itemSlot.Name)!;
                const index = difficultyItems.indexOf(item);
                itemSlot.LayoutOrder = index;
                itemSlot.Visible = index > -1;
            }
            difficultyOption.Visible = true;
        }
    }

    showPurchaseWindow(item: Item) {
        const items = ItemsCanister.items.get();
        if (items === undefined) {
            return;
        }
        this.selected = item;
        SHOP_WINDOW.PurchaseWindow.Title.DifficultyLabel.Image = "rbxassetid://" + item.difficulty?.image;
        SHOP_WINDOW.PurchaseWindow.Title.ItemNameLabel.Text = (item.name ?? "error") + " (Owned: " + ItemCounter.getTotalAmount(items, item.id) + ")";
        SHOP_WINDOW.PurchaseWindow.ViewportFrame.ClearAllChildren();
        this.itemSlotController.loadViewportFrame(SHOP_WINDOW.PurchaseWindow.ViewportFrame, item);
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.Text = item.description ?? "<no description available>";
        const price = item.getPrice((items.bought.get(item.id) ?? 0) + 1);
        let riLabel = price?.tostring();
        const requiredItems = item.requiredItems;
        if (requiredItems !== undefined && riLabel !== undefined) {
            const vals = new Array<string>();
            requiredItems.forEach((amount, key) => vals.push(`${amount} ${key.name}`));
            riLabel = combineHumanReadable(riLabel, ...vals);
        }
        let paLabel = "";
        const placeableAreas = item.placeableAreas;
        if (placeableAreas !== undefined) {
            const vals = new Array<string>();
            placeableAreas.forEach((area) => vals.push(area.name));
            paLabel = combineHumanReadable(paLabel, ...vals);
        }
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel.Text = `Creator: ${item.creator}`;
        SHOP_WINDOW.PurchaseWindow.Purchase.PriceLabel.Text = `Cost: ${price === undefined ? "Unavailable" : riLabel}`;
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.PlaceableAreasLabel.Text = `Placeable in: ${paLabel}`;
        let color = item.difficulty?.color ?? new Color3();
        color = new Color3(color.R + 0.2, color.G + 0.2, color.B + 0.2);
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.Size = new UDim2(1, 0, 0.8, -SHOP_WINDOW.PurchaseWindow.Purchase.AbsoluteSize.Y);
        SHOP_WINDOW.PurchaseWindow.Purchase.Visible = price !== undefined;
    
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel.Visible = item.creator !== undefined;
    }

    onInit() {
        for (const [_id, difficulty] of pairs(Difficulty.DIFFICULTIES)) {
            const difficultyOption = this.itemSlotController.getDifficultyOption(difficulty);
            difficultyOption.Visible = false;
            difficultyOption.Parent = SHOP_WINDOW.ItemListWrapper.ItemList;
        }
        for (const [_id, item] of Items.init()) {
            const [itemSlot, _v] = this.itemSlotController.getItemSlot(item);
            SHOP_WINDOW.GetPropertyChangedSignal("Visible").Connect(() => itemSlot.ViewportFrame.SetAttribute("Delta", SHOP_WINDOW.Visible ? 0.4 : 0));
            const diff = item.difficulty;
            if (diff === undefined) {
                error("No difficulty found");
            }
            itemSlot.Visible = false;
            itemSlot.Activated.Connect(() => {
                this.uiController.playSound("Click");
                this.showPurchaseWindow(item);
            });
            task.spawn(() => {
                let t = 0;
                let index = -1;
                let checks = 0;
                let lastPrice: Price | undefined = undefined;
                RunService.BindToRenderStep("priceDisplay", 0, (dt) => {
                    t += dt;
                    if (!itemSlot.Visible || t < 0.5) {
                        return;
                    }
                    t = 0;
                    ++checks;
                    const price = item.getPrice((ItemsCanister.items.get().bought.get(item.id) ?? 0) + 1);
                    if (price === undefined) {
                        itemSlot.AmountLabel.Text = "MAXED";
                        itemSlot.AmountLabel.TextColor3 = Color3.fromRGB(255, 156, 5);
                    }
                    else {
                        if (lastPrice !== price) {
                            index = -1;
                        }
                        else if (checks < 3) {
                            return;
                        }
                        checks = 0;
                        let currency: Currency | undefined = undefined;
                        let cost: InfiniteMath | undefined = undefined;
                        const loop = () => {
                            let i = 0;
                            for (const [iCurrency, iCost] of price.costPerCurrency) {
                                if (i === index + 1) {
                                    currency = iCurrency;
                                    cost = iCost;
                                    index = i;
                                    break;
                                }
                                ++i;
                            }
                            return currency;
                        }
                        if (loop() === undefined) {
                            index = -1;
                            currency = loop();
                        }
                        if (currency !== undefined) {
                            itemSlot.AmountLabel.Text = price.tostring(currency, cost);
                            TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), { TextColor3: Price.DETAILS_PER_CURRENCY[currency].color }).Play();
                        }
                        lastPrice = price;
                    }
                });
            });
            itemSlot.Parent = SHOP_WINDOW.ItemListWrapper.ItemList.FindFirstChild(diff.id)?.WaitForChild("Items");
        }

        this.difficultyOptions = SHOP_WINDOW.ItemListWrapper.ItemList.GetChildren() as DifficultyOption[];

        ItemsCanister.items.observe(() => {
            if (this.selected !== undefined) {
                this.showPurchaseWindow(this.selected);
            }
        });
        ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            const s = prompt.GetAttribute("Shop") as string | undefined;
            if (player === LOCAL_PLAYER && !this.buildController.buildModeEnabled && s !== undefined) {
                this.uiController.playSound("Flip");
                const item = Items.getItem(prompt.Name);
                if (item !== undefined && item.isA("Shop"))
                    this.showShopWindow(item, s);
                else
                    warn(`Item ${item?.id} is not a Shop`);
            }
        });
        PLACED_ITEMS_FOLDER.ChildRemoved.Connect((child) => {
            if (child.Name === this.placementId) {
                this.adaptiveTabController.hideAdaptiveTab();
            }
        });
        this.hotkeysController.setHotkey(SHOP_WINDOW.PurchaseWindow.Purchase, Enum.KeyCode.E, () => {
            if (!SHOP_WINDOW.Visible) {
                return false;
            }
            this.uiController.playSound(this.selected !== undefined && ItemsCanister.buyItem.invoke(this.selected.id) ? "Coins" : "Error");
            return true;
        }, "Buy", 1);
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel.MouseMoved.Connect(() => {
            TweenService.Create(SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel, new TweenInfo(0.2), { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
        });
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel.MouseLeave.Connect(() => {
            TweenService.Create(SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel, new TweenInfo(0.2), { TextTransparency: 0.8, TextStrokeTransparency: 0.8 }).Play();
        });
        this.hotkeysController.setHotkey(SHOP_WINDOW.PurchaseWindow.CloseButton, Enum.KeyCode.X, () => {
            if (SHOP_WINDOW.Visible) {
                this.uiController.playSound("Flip");
                return this.hideShopWindow();
            }
            return false;
        }, "Close", 2);
        this.hotkeysController.setHotkey(SHOP_WINDOW.ItemListWrapper.ItemList.BuyAll, Enum.KeyCode.O, () => {
            if (SHOP_WINDOW.Visible && this.lastShop !== undefined) {
                this.uiController.playSound(ItemsCanister.buyAllItems.invoke(this.lastShop) ? "Coins" : "Error");
                return true;
            }
            return false;
        }, "Buy All Items", 5);
    }
}