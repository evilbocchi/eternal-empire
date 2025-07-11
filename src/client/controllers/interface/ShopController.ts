import { Fletchette } from "@antivivi/fletchette";
import { Connection } from "@antivivi/fletchette/out/Signal";
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { ProximityPromptService, RunService, TweenService } from "@rbxts/services";
import { LOCAL_PLAYER, SHOP_WINDOW } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS, ASSETS, DifficultyOption, ItemSlot, PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Shop from "shared/item/Shop";
import Items from "shared/items/Items";
import ItemCounter from "shared/utils/ItemCounter";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");
const CurrencyCanister = Fletchette.getCanister("CurrencyCanister");

@Controller()
export class ShopController implements OnInit {
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

    descColorHex = SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.TextColor3.ToHex();
    defaultTooltips = new Map<ItemSlot, string>();
    difficultyOptions = new Array<DifficultyOption>();
    placementId = undefined as string | undefined;
    selected = undefined as Item | undefined;
    lastShop = undefined as string | undefined;
    currentContainerId = 0;
    currentContainerSpace = 0;
    sufficientColor = Color3.fromRGB(255, 255, 255);
    insufficientColor = Color3.fromRGB(255, 80, 80);


    constructor(private hotkeysController: HotkeysController, private uiController: UIController, 
        private adaptiveTabController: AdaptiveTabController, private buildController: BuildController, 
        private itemSlotController: ItemSlotController, private tooltipController: TooltipController) {
        
    }

    showShopWindow(item?: Shop, placementId?: string) {
        if (item !== undefined) {
            this.refreshShopWindow(item, placementId);
        }
        this.buildController.hideBuildWindow();
        this.lastShop = item?.id;
        SHOP_WINDOW.Active = true;
        if (!SHOP_WINDOW.Visible)
            SHOP_WINDOW.Position = new UDim2(0.5, 0, 2.5, 0);

        SHOP_WINDOW.Visible = true;
        TweenService.Create(SHOP_WINDOW, this.tween, {Position: new UDim2(0.5, 0, 1, 5)}).Play();
    }

    hideShopWindow() {
        if (SHOP_WINDOW.Visible === false) {
            return false;
        }
        this.buildController.showBuildWindow();
        SHOP_WINDOW.Active = false;
        const tween = TweenService.Create(SHOP_WINDOW, this.tween, {Position: new UDim2(0.5, 0, 2.5, 0)});
        tween.Play();
        tween.Completed.Once((playbackState) => {
            if (playbackState === Enum.PlaybackState.Completed)
                SHOP_WINDOW.Visible = false;
        });
        return true;
    }

    refreshShopWindow(item: Shop, placementId?: string) {
        const color = item.difficulty?.color;
        if (color) {
            SHOP_WINDOW.UIStroke.Color = color;
        }
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
    
    createPriceOption(amount: OnoeNum | number, currency: Currency | undefined, item: Item | undefined) {
        const option = ASSETS.ShopWindow.PriceOption.Clone();
        let connection: Connection;
        if (currency !== undefined) {
            const details = Price.DETAILS_PER_CURRENCY[currency];
            option.ImageLabel.Image = "rbxassetid://" + details.image;
            option.LayoutOrder = details.layoutOrder;
            option.ImageLabel.Visible = true;
            option.ViewportFrame.Visible = false;
            option.AmountLabel.Text = Price.getFormatted(currency, amount as OnoeNum, true);
            connection = CurrencyCanister.balance.observe((balance) => {
                if (option === undefined || option.Parent === undefined) {
                    connection.disconnect();
                    return;
                }
                const inBalance = balance.get(currency);
                option.AmountLabel.TextColor3 = inBalance !== undefined && (amount as OnoeNum).lessEquals(inBalance) ? this.sufficientColor : this.insufficientColor;
            });
        }
        else if (item !== undefined) {
            this.itemSlotController.loadViewportFrame(option.ViewportFrame, item);
            option.LayoutOrder = 1000 + (item.difficulty?.rating ?? 0);
            option.ImageLabel.Visible = false;
            option.ViewportFrame.Visible = true;
            option.AmountLabel.Text = amount + " " + item.name;
            connection = ItemsCanister.items.observe((items) => {
                if (option === undefined || option.Parent === undefined) {
                    connection.disconnect();
                    return;
                }
                const inInventory = items.inventory.get(item.id);
                option.AmountLabel.TextColor3 = inInventory === undefined || inInventory < (amount as number) ? this.insufficientColor : this.sufficientColor;
            });
        }
        option.Destroying.Once(() => connection.disconnect());
        this.assignContainer(option);
    }

    assignContainer(priceOption: typeof ASSETS.ShopWindow.PriceOption) {
        priceOption.Parent = SHOP_WINDOW.PurchaseWindow.Purchase.Price;
        const size = priceOption.AbsoluteSize.X + 5;
        let currentContainer = SHOP_WINDOW.PurchaseWindow.Purchase.Price.FindFirstChild(this.currentContainerId) as typeof ASSETS.ShopWindow.PriceOptionsContainer | undefined;
        if (currentContainer === undefined || this.currentContainerSpace < size) {
            currentContainer = ASSETS.ShopWindow.PriceOptionsContainer.Clone();
            currentContainer.Name = tostring(++this.currentContainerId);
            currentContainer.Parent = SHOP_WINDOW.PurchaseWindow.Purchase.Price;
            this.currentContainerSpace = currentContainer.AbsoluteSize.X + 5;
        }
        this.currentContainerSpace -= size;
        priceOption.Parent = currentContainer;
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
        let description = this.itemSlotController.formatDescription(item, 21, "Medium");
        for (const option of SHOP_WINDOW.PurchaseWindow.Purchase.Price.GetChildren()) {
            if (option.IsA("Frame"))
                option.Destroy();
        }
        const price = item.getPrice((items.bought.get(item.id) ?? 0) + 1);
        if (price === undefined) {
            SHOP_WINDOW.PurchaseWindow.Purchase.HeadingLabel.Text = "Unavailable";
        }
        else {
            SHOP_WINDOW.PurchaseWindow.Purchase.HeadingLabel.Text = "Cost:";
            for (const [currency, cost] of price.costPerCurrency)
                this.createPriceOption(cost, currency, undefined);
            for (const [requiredItem, amount] of item.requiredItems)
                this.createPriceOption(amount, undefined, requiredItem);
        }
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel.Text = `Creator: ${item.creator}`;
        
        const hasFormula = item.formula !== undefined;
        const hasSlamoVillage = AREAS.SlamoVillage.unlocked.Value === true;
        if (hasFormula || hasSlamoVillage) {
            description += `\n<font size="7"> </font>`;
        }
        if (hasFormula)
            description += `\n${this.itemSlotController.formatFormula(item, ItemsCanister.multiplierPerItem.get()?.get(item.id), 18, "Medium")}`;
        if (item.placeableAreas.isEmpty() || hasSlamoVillage)
            description += `\n${this.itemSlotController.formatPlaceableAreas(item, 18, "Medium")}`;
        if (hasSlamoVillage)
            description += `\n${this.itemSlotController.formatResettingAreas(item, 18, "Medium")}`;

        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.Text = description;
        let color = item.difficulty?.color ?? new Color3();
        color = new Color3(color.R + 0.2, color.G + 0.2, color.B + 0.2);
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.Size = new UDim2(1, 0, 0.8, -SHOP_WINDOW.PurchaseWindow.Purchase.AbsoluteSize.Y - 40);
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
            this.defaultTooltips.set(itemSlot, this.tooltipController.tooltipsPerObject.get(itemSlot)!);
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
                    const owned = ItemsCanister.items.get().bought.get(item.id) ?? 0;
                    const price = item.getPrice(owned + 1);
                    let info = `\n<font size="4"> </font>`;
                    if (price !== undefined) {
                        info += `\n<font color="#ffff00" size="16">Cost: ${price.tostring()}</font>`;
                    }
                    info += `\n<font color="#9de5ff" size="16">Owned: ${owned}</font>`;
                    this.tooltipController.setTooltip(itemSlot, this.defaultTooltips.get(itemSlot) + info);
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
                        let cost: OnoeNum | undefined = undefined;
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
            if (player === LOCAL_PLAYER && s !== undefined) {
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