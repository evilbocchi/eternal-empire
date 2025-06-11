import { Connection } from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { CollectionService, RunService, TweenService } from "@rbxts/services";
import ItemFilter from "client/ItemFilter";
import ItemSlot from "client/ItemSlot";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { ADAPTIVE_TAB_MAIN_WINDOW, AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Packets from "shared/Packets";
import { ASSETS } from "shared/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";
import ItemCounter from "shared/item/ItemCounter";
import { buildRichText } from "@antivivi/vrldk";

declare global {
    type DifficultyLabel = Frame & {
        ImageLabel: ImageLabel;
        TextLabel: TextLabel;
    };
}

export const SHOP_GUI = (function () {
    const shopGui = ASSETS.ShopWindow.ShopGui.Clone();
    shopGui.ResetOnSpawn = false;
    shopGui.Parent = PLAYER_GUI;
    return shopGui;
})();

export const PURCHASE_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Purchase") as Frame & {
    ItemSlot: ItemSlot & {
        Contents: Frame & {
            ViewportFrame: ViewportFrame;
            Identification: Frame & {
                Difficulty: DifficultyLabel;
                TitleLabel: TextLabel;
            };
        };
        AmountLabel: TextLabel;
    };
    DescriptionFrame: ScrollingFrame & {
        DescriptionLabel: TextLabel;
        CreatorLabel: TextLabel;
    };
    Purchase: TextButton & {
        Price: Frame;
        HeadingLabel: TextLabel;
    };
};

const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 21, "Medium"));
}

@Controller()
export class ShopController implements OnInit, OnStart {

    readonly sufficientColor = Color3.fromRGB(255, 255, 255);
    readonly insufficientColor = Color3.fromRGB(255, 80, 80);
    readonly descColor = PURCHASE_WINDOW.DescriptionFrame.DescriptionLabel.TextColor3;

    readonly filterItems = ItemFilter.loadFilterOptions(SHOP_GUI.FilterOptions, (query, whitelistedTraits) => {
        const items = this.lastShop?.items;
        if (items === undefined)
            return;
        ItemSlot.filterItems(this.itemSlotsPerItem, items, query, whitelistedTraits);
    });

    itemSlotsPerItem = new Map<Item, ItemSlot>();
    selected = undefined as Item | undefined;

    shopGuiPart: Part | undefined;
    lastShop: Shop | undefined;
    indexPerItem = new Map<Item, number>();
    currentContainerId = 0;
    currentContainerSpace = 0;
    hideMaxedItems: boolean | undefined;

    constructor(private hotkeysController: HotkeysController, private uiController: UIController,
        private adaptiveTabController: AdaptiveTabController, private tooltipController: TooltipController) {

    }

    hideShopGuiPart(shopGuiPart: Part) {
        TweenService.Create(shopGuiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 1 }).Play();
    }

    refreshShop(shopGuiPart?: Part, shop?: Shop) {
        if (shopGuiPart !== undefined && this.shopGuiPart === shopGuiPart)
            return;

        const old = this.shopGuiPart;
        if (old !== undefined && old !== shopGuiPart) {
            this.hideShopGuiPart(old);
        }

        this.shopGuiPart = shopGuiPart;
        this.lastShop = shop;

        SHOP_GUI.Adornee = shopGuiPart;
        if (shopGuiPart === undefined || shop === undefined) {
            SHOP_GUI.Enabled = false;
            return;
        }

        TweenService.Create(shopGuiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 0 }).Play();
        SHOP_GUI.Enabled = true;

        const item = shop.item;
        const color = item.difficulty.color;
        if (color !== undefined) {
            SHOP_GUI.ItemList.UIStroke.Color = color;
        }

        this.filterItems();
        this.priceCycle();
    }

    createPriceOption(amount: OnoeNum | number, currency: Currency | undefined, item: Item | undefined) {
        const option = ASSETS.ShopWindow.PriceOption.Clone();
        let connection: Connection;
        if (currency !== undefined) {
            const details = CURRENCY_DETAILS[currency];
            option.ImageLabel.Image = "rbxassetid://" + details.image;
            option.LayoutOrder = details.layoutOrder;
            option.ImageLabel.Visible = true;
            option.ViewportFrame.Visible = false;
            option.AmountLabel.Text = CurrencyBundle.getFormatted(currency, amount as OnoeNum, true);
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
            ItemSlot.loadViewportFrame(option.ViewportFrame, item);
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
        priceOption.Parent = PURCHASE_WINDOW.Purchase.Price;
        const size = priceOption.AbsoluteSize.X + 5;
        let currentContainer = PURCHASE_WINDOW.Purchase.Price.FindFirstChild(this.currentContainerId) as typeof ASSETS.ShopWindow.PriceOptionsContainer | undefined;
        if (currentContainer === undefined || this.currentContainerSpace < size) {
            currentContainer = ASSETS.ShopWindow.PriceOptionsContainer.Clone();
            currentContainer.Name = tostring(++this.currentContainerId);
            currentContainer.Parent = PURCHASE_WINDOW.Purchase.Price;
            this.currentContainerSpace = currentContainer.AbsoluteSize.X + 5;
        }
        this.currentContainerSpace -= size;
        priceOption.Parent = currentContainer;
    }

    refreshPurchaseWindow(item: Item) {
        const itemSlot = PURCHASE_WINDOW.ItemSlot;
        const identification = itemSlot.Contents.Identification;
        const viewportFrame = itemSlot.Contents.ViewportFrame;

        const inventory = Packets.inventory.get();
        const bought = Packets.bought.get();
        const placed = Packets.placedItems.get();
        if (inventory === undefined || bought === undefined || placed === undefined)
            return;

        this.selected = item;

        identification.TitleLabel.Text = item.name ?? "error";

        ItemSlot.loadDifficultyLabel(identification.Difficulty, item.difficulty);
        ItemSlot.colorItemSlot(itemSlot, item.difficulty);

        const [invCount, placedCount] = ItemCounter.getAmounts(inventory, placed, item.id);
        itemSlot.AmountLabel.Text = `Owned ${invCount + placedCount}`;

        viewportFrame.ClearAllChildren();
        ItemSlot.loadViewportFrame(viewportFrame, item);
        for (const option of PURCHASE_WINDOW.Purchase.Price.GetChildren()) {
            if (option.IsA("Frame"))
                option.Destroy();
        }
        let price = item.getPrice((bought.get(item.id) ?? 0) + 1);

        if (RunService.IsStudio() && price === undefined) {
            price = item.getPrice(bought.get(item.id) ?? 0);
        }

        if (price !== undefined) {
            for (const [currency, amount] of price.amountPerCurrency)
                this.createPriceOption(amount, currency, undefined);

            for (const [requiredItem, amount] of item.requiredItems)
                this.createPriceOption(amount, undefined, requiredItem);

            PURCHASE_WINDOW.Purchase.Visible = true;
        }
        else {
            PURCHASE_WINDOW.Purchase.Visible = false;
        }

        PURCHASE_WINDOW.DescriptionFrame.CreatorLabel.Text = `Creator: ${item.creator}`;

        const builder = buildRichText(undefined, item.format(item.description), this.descColor, 21, "Medium");
        builder.appendAll(METADATA_PER_ITEM.get(item)!.builder);
        PURCHASE_WINDOW.DescriptionFrame.DescriptionLabel.Text = builder.toString();
        PURCHASE_WINDOW.DescriptionFrame.Size = new UDim2(1, 0, 0.8, -PURCHASE_WINDOW.Purchase.AbsoluteSize.Y - 40);
        PURCHASE_WINDOW.Purchase.Visible = price !== undefined;
        PURCHASE_WINDOW.DescriptionFrame.CreatorLabel.Visible = item.creator !== undefined;
    }

    hidePurchaseWindow() {
        if (PURCHASE_WINDOW.Visible === false)
            return false;

        this.adaptiveTabController.hideAdaptiveTab();
        this.selected = undefined;
        return true;
    }

    loadItemSlots() {
        for (const [_id, item] of Items.itemsPerId) {
            const itemSlot = ItemSlot.loadItemSlot(ASSETS.ShopWindow.ItemSlot.Clone(), item);
            const diff = item.difficulty;
            if (diff === undefined) {
                error("No difficulty found");
            }
            itemSlot.Visible = false;
            itemSlot.Activated.Connect(() => {
                this.uiController.playSound("Click");
                this.refreshPurchaseWindow(item);
                this.adaptiveTabController.showAdaptiveTab("Purchase");
            });
            this.itemSlotsPerItem.set(item, itemSlot);
            itemSlot.Parent = SHOP_GUI.ItemList;
        }
    }

    /**
     * Cycles through each currency for all visible item slots, updating the price label and color.
     */
    priceCycle() {
        const hideMaxedItems = this.hideMaxedItems;
        const bought = Packets.bought.get();
        for (const [item, itemSlot] of this.itemSlotsPerItem) {
            if (itemSlot.Visible === false) {
                continue;
            }
            const price = item.getPrice((bought.get(item.id) ?? 0) + 1);

            if (price === undefined) {
                itemSlot.Visible = !hideMaxedItems;
                if (hideMaxedItems !== true) {
                    itemSlot.AmountLabel.Text = "MAXED";
                    itemSlot.AmountLabel.TextColor3 = Color3.fromRGB(255, 156, 5);
                }
                continue;
            }

            let amount: OnoeNum | undefined = undefined;
            let firstCurrency: Currency | undefined;
            let firstAmount: OnoeNum | undefined;
            const loop = () => {
                let i = 0;
                const index = this.indexPerItem.get(item);
                for (const [iCurrency, iAmount] of price.amountPerCurrency) {
                    if (i === 0) {
                        firstCurrency = iCurrency;
                        firstAmount = iAmount;
                    }
                    if (index === undefined || i === index + 1) {
                        this.indexPerItem.set(item, i);
                        amount = iAmount;
                        return iCurrency;
                    }
                    ++i;
                }
                this.indexPerItem.set(item, 0);
                amount = firstAmount;
                return firstCurrency;
            };
            const currency = loop();
            if (currency !== undefined) {
                itemSlot.AmountLabel.Text = CurrencyBundle.getFormatted(currency, amount);
                TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), { TextColor3: CURRENCY_DETAILS[currency].color }).Play();
            }
        }
    }

    onInit() {
        this.refreshShop();
        this.hidePurchaseWindow();

        Packets.settings.observe((settings) => {
            if (settings.HideMaxedItems === this.hideMaxedItems)
                return;
            this.hideMaxedItems = settings.HideMaxedItems;
        });

        Packets.inventory.observe(() => {
            if (this.selected === undefined)
                return;
            this.refreshPurchaseWindow(this.selected);
        });

        this.hotkeysController.setHotkey(PURCHASE_WINDOW.Purchase, Enum.KeyCode.E, () => {
            if (!SHOP_GUI.Enabled) {
                return false;
            }
            this.uiController.playSound(this.selected !== undefined && Packets.buyItem.invoke(this.selected.id) ? "Coins" : "Error");
            return true;
        }, "Buy", 1);

        this.hotkeysController.setHotkey(SHOP_GUI.ItemList.BuyAll.Button, Enum.KeyCode.O, () => {
            if (SHOP_GUI.Enabled && this.lastShop !== undefined) {
                const items = new Array<string>();
                for (const [item, slot] of this.itemSlotsPerItem) {
                    if (slot.Visible === false)
                        continue;
                    items.push(item.id);
                }
                this.uiController.playSound(Packets.buyAllItems.invoke(items) ? "Coins" : "Error");
                return true;
            }
            return false;
        }, "Buy All Items", 5);

        PURCHASE_WINDOW.DescriptionFrame.CreatorLabel.MouseMoved.Connect(() => {
            TweenService.Create(PURCHASE_WINDOW.DescriptionFrame.CreatorLabel, new TweenInfo(0.2), { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
        });

        PURCHASE_WINDOW.DescriptionFrame.CreatorLabel.MouseLeave.Connect(() => {
            TweenService.Create(PURCHASE_WINDOW.DescriptionFrame.CreatorLabel, new TweenInfo(0.2), { TextTransparency: 0.8, TextStrokeTransparency: 0.8 }).Play();
        });

        ItemSlot.hookMetadata(METADATA_PER_ITEM);

        this.loadItemSlots();
    }

    onStart() {
        let t = 0;
        RunService.BindToRenderStep("Shop CurrencyBundle Cycle", 1, (dt) => {
            t += dt;
            if (t < 2) {
                return;
            }
            t = 0;
            this.priceCycle();
        });

        task.spawn(() => {
            const headingLabel = PURCHASE_WINDOW.Purchase.HeadingLabel;

            while (task.wait(1 / 20)) {
                const amountLabels = new Array<TextLabel>();
                for (const descendant of PURCHASE_WINDOW.Purchase.Price.GetDescendants()) {
                    if (descendant.Name === "PriceOption") {
                        amountLabels.push((descendant as typeof ASSETS.ShopWindow.PriceOption).AmountLabel);
                    }
                }

                if (amountLabels.size() === 0) {
                    continue;
                }

                let affordable = true;
                for (const amountLabel of amountLabels) {
                    if (amountLabel.TextColor3 === this.insufficientColor) {
                        affordable = false;
                        break;
                    }
                }

                headingLabel.Text = affordable ? "PURCHASE" : "UNAFFORDABLE";
            }
        });

        task.spawn(() => {
            while (task.wait(0.1)) {
                const primaryPart = LOCAL_PLAYER.Character?.PrimaryPart;
                if (primaryPart === undefined)
                    continue;

                const shopHitboxes = CollectionService.GetTagged("Shop");
                let found = false;
                for (const hitbox of shopHitboxes) {
                    if (!hitbox.IsA("Part"))
                        continue;
                    const model = hitbox.Parent;
                    if (model === undefined || model.GetAttribute("Selected"))
                        continue;

                    const shopGuiPart = model.FindFirstChild("ShopGuiPart") as Part | undefined;
                    if (shopGuiPart === undefined)
                        continue;

                    if (shopGuiPart.GetAttribute("ClientLoaded") !== true) {
                        this.hideShopGuiPart(shopGuiPart);
                        shopGuiPart.SetAttribute("ClientLoaded", true);
                    }

                    if (!hitbox.GetTouchingParts().includes(primaryPart))
                        continue;

                    const itemId = model.GetAttribute("ItemId") as string | undefined;
                    if (itemId === undefined)
                        continue;

                    const item = Items.getItem(itemId);
                    if (item === undefined)
                        continue;

                    this.refreshShop(shopGuiPart, item.trait(Shop));
                    found = true;
                    break;
                }

                if (found === false) {
                    this.refreshShop();
                }
            }
        });
    }
}