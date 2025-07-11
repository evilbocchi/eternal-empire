import Difficulty from "@antivivi/jjt-difficulties";
import { Connection } from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnStart } from "@flamework/core";
import { ProximityPromptService, RunService, TweenService } from "@rbxts/services";
import { INTERFACE, LOCAL_PLAYER, SHOP_WINDOW } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Price from "shared/Price";
import { ASSETS, DifficultyOption, ItemSlot, PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Shop from "shared/item/Shop";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import ItemCounter from "shared/utils/ItemCounter";
import StringBuilder from "shared/utils/StringBuilder";

@Controller()
export class ShopController implements OnStart {
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

    descColorHex = SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.TextColor3.ToHex();
    defaultTooltips = new Map<ItemSlot, string>();
    difficultyOptionsPerItem = new Map<Item, DifficultyOption>();
    itemSlotsPerItem = new Map<Item, ItemSlot>();
    placementId = undefined as string | undefined;
    selected = undefined as Item | undefined;
    lastShop = undefined as string | undefined;
    currentContainerId = 0;
    currentContainerSpace = 0;
    sufficientColor = Color3.fromRGB(255, 255, 255);
    insufficientColor = Color3.fromRGB(255, 80, 80);
    calibrated: UDim2 | undefined;


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
        const shopItems = item.items;
        if (this.selected === undefined || !shopItems.includes(this.selected)) {
            this.showPurchaseWindow(shopItems[0]);
        }
        const visibilityPerDifficultyOption = new Map<DifficultyOption, boolean>();
        for (const [item, difficultyOption] of this.difficultyOptionsPerItem) {
            const index = shopItems.indexOf(item);
            const hasItem = index > -1;
            if (hasItem) {
                visibilityPerDifficultyOption.set(difficultyOption, true);  
            }
            else if (visibilityPerDifficultyOption.has(difficultyOption) === false) {
                visibilityPerDifficultyOption.set(difficultyOption, false);
            }    
            const itemSlot = this.itemSlotsPerItem.get(item);
            if (itemSlot !== undefined) {
                itemSlot.LayoutOrder = index;
                itemSlot.Visible = hasItem;
            }
        }
        task.spawn(() => {
            for (const [difficultyOption, visibility] of visibilityPerDifficultyOption)
                difficultyOption.Visible = visibility; 
        });
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
            connection = Packets.balance.observe((balance) => {
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
            connection = Packets.inventory.observe((inventory) => {
                if (option === undefined || option.Parent === undefined) {
                    connection.disconnect();
                    return;
                }
                const inInventory = inventory.get(item.id);
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
        const inventory = Packets.inventory.get();
        const bought = Packets.bought.get();
        const placed = Packets.placedItems.get();
        if (inventory === undefined || bought === undefined || placed === undefined) {
            return;
        }
        this.selected = item;
        SHOP_WINDOW.PurchaseWindow.Title.DifficultyLabel.Image = "rbxassetid://" + item.difficulty?.image;
        SHOP_WINDOW.PurchaseWindow.Title.ItemNameLabel.Text = (item.name ?? "error") + " (Owned: " + ItemCounter.getTotalAmount(inventory, placed, item.id) + ")";
        SHOP_WINDOW.PurchaseWindow.ViewportFrame.ClearAllChildren();
        this.itemSlotController.loadViewportFrame(SHOP_WINDOW.PurchaseWindow.ViewportFrame, item);
        for (const option of SHOP_WINDOW.PurchaseWindow.Purchase.Price.GetChildren()) {
            if (option.IsA("Frame"))
                option.Destroy();
        }
        let price = item.getPrice((bought.get(item.id) ?? 0) + 1);
        if (RunService.IsStudio() && price === undefined) {
            price = item.getPrice(bought.get(item.id) ?? 0)
        }
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

        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.Text = 
            this.itemSlotController.formatMetadata(item, this.itemSlotController.formatDescription(item, 21, "Medium"), 18, "Medium");
        let color = item.difficulty?.color ?? new Color3();
        color = new Color3(color.R + 0.2, color.G + 0.2, color.B + 0.2);
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.Size = new UDim2(1, 0, 0.8, -SHOP_WINDOW.PurchaseWindow.Purchase.AbsoluteSize.Y - 40);
        SHOP_WINDOW.PurchaseWindow.Purchase.Visible = price !== undefined;
    
        SHOP_WINDOW.PurchaseWindow.DescriptionFrame.CreatorLabel.Visible = item.creator !== undefined;
    }

    recalibrate(difficultyOption: DifficultyOption) {
        this.calibrated = new UDim2(1 / this.itemSlotController.calculateOptimalCellCount(difficultyOption.Items.AbsoluteSize.X), -12, 1, 0);
    }

    loadItemSlots(coalesce: boolean) {
        for (const [_id, item] of Items.itemsPerId) {
            const itemSlot = this.itemSlotController.getItemSlot(item, item.isA("HarvestingTool"));
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
            itemSlot.MouseEnter.Connect(() => {
                const owned = Packets.bought.get()?.get(item.id) ?? 0;
                const price = item.getPrice(owned + 1);
                const builder = new StringBuilder('\n<font size="4"> </font>');
                if (price !== undefined) {
                    builder.append(`\n<font color="#ffff00" size="16">Cost: ${price.toString()}</font>`);
                }
                builder.append(`\n<font color="#9de5ff" size="16">Owned: ${owned}</font>`);
                this.tooltipController.setTooltip(itemSlot, this.defaultTooltips.get(itemSlot) + builder.toString());
            });
            const category = coalesce === true ? Difficulty.Main : item.difficulty!;
            let difficultyOption = SHOP_WINDOW.ItemListWrapper.ItemList.FindFirstChild(category.id) as DifficultyOption | undefined;
            if (difficultyOption === undefined) {
                difficultyOption = this.itemSlotController.getDifficultyOption(category);
                if (item.difficulty === Difficulty.Excavation) {
                    difficultyOption.LayoutOrder += 5000000;
                }
                //difficultyOption.LayoutOrder = -difficultyOption.LayoutOrder;
                difficultyOption.Visible = false;
                difficultyOption.Parent = SHOP_WINDOW.ItemListWrapper.ItemList;
                if (this.calibrated === undefined)
                    this.recalibrate(difficultyOption);
                difficultyOption.Items.UIGridLayout.CellSize = this.calibrated!;
            }
            this.difficultyOptionsPerItem.set(item, difficultyOption);
            this.itemSlotsPerItem.set(item, itemSlot);
            itemSlot.Parent = difficultyOption.Items;
        }
    }

    onStart() {
        Packets.settings.observe((settings) => {
            const objs = SHOP_WINDOW.ItemListWrapper.ItemList.GetChildren();
            for (const obj of objs)
                if (obj.IsA("Frame"))
                    obj.Destroy();
            this.loadItemSlots(settings.CoalesceItemCategories);
        });

        Packets.inventory.observe(() => {
            if (this.selected !== undefined) {
                this.showPurchaseWindow(this.selected);
            }
        });
        Packets.openShop.connect((itemId) => this.showShopWindow(Items.getItem(itemId) as Shop));
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
            this.uiController.playSound(this.selected !== undefined && Packets.buyItem.invoke(this.selected.id) ? "Coins" : "Error");
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
                this.uiController.playSound(Packets.buyAllItems.invoke(this.lastShop) ? "Coins" : "Error");
                return true;
            }
            return false;
        }, "Buy All Items", 5);

        INTERFACE.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
            let recalibrated = false;
            const difficultyOptions = SHOP_WINDOW.ItemListWrapper.ItemList.GetChildren();
            for (const dO of difficultyOptions) {
                if (!dO.IsA("Frame"))
                    continue;
                const difficultyOption = dO as DifficultyOption;
                if (recalibrated === false) {
                    recalibrated = true;
                    this.recalibrate(difficultyOption);
                }
                difficultyOption.Items.UIGridLayout.CellSize = this.calibrated!;
            }
        });

        let t = 0;
        const indexPerItem = new Map<Item, number>();
        RunService.BindToRenderStep("Shop Price Cycle", 1, (dt) => {
            t += dt;
            if (t < 2) {
                return;
            }
            t = 0;
            const bought = Packets.bought.get();
            
            for (const [item, itemSlot] of this.itemSlotsPerItem) {
                if (itemSlot.Visible === false) {
                    continue;
                }
                const price = item.getPrice((bought.get(item.id) ?? 0) + 1);
                
                if (price === undefined) {
                    itemSlot.AmountLabel.Text = "MAXED";
                    itemSlot.AmountLabel.TextColor3 = Color3.fromRGB(255, 156, 5);
                    continue;
                }

                let cost: OnoeNum | undefined = undefined;
                let firstCurrency: Currency | undefined;
                let firstCost: OnoeNum | undefined;
                const loop = () => {
                    let i = 0;
                    const index = indexPerItem.get(item);
                    for (const [iCurrency, iCost] of price.costPerCurrency) {
                        if (i === 0) {
                            firstCurrency = iCurrency;
                            firstCost = iCost;
                        }
                        if (index === undefined || i === index + 1) {
                            indexPerItem.set(item, i);
                            cost = iCost;
                            return iCurrency;
                        }
                        ++i;
                    }
                    indexPerItem.set(item, 0);
                    cost = firstCost;
                    return firstCurrency;
                }
                const currency = loop();
                if (currency !== undefined) {
                    itemSlot.AmountLabel.Text = price.toString(currency, cost);
                    TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), { TextColor3: Price.DETAILS_PER_CURRENCY[currency].color }).Play();
                }
            }
        });
    }
}