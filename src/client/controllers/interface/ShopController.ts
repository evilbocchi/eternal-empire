import { Connection } from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { buildRichText } from "@antivivi/vrldk";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { CollectionService, RunService, TweenService } from "@rbxts/services";
import ItemFilter from "client/ItemFilter";
import ItemSlot from "client/ItemSlot";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import HotkeysController from "client/controllers/HotkeysController";
import UIController from "client/controllers/UIController";
import AdaptiveTabController, { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/interface/AdaptiveTabController";
import TooltipController from "client/controllers/interface/TooltipController";
import { ASSETS } from "shared/GameAssets";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemCounter from "shared/item/ItemCounter";
import ItemMetadata from "shared/item/ItemMetadata";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";

declare global {
    /**
     * Represents the label for the difficulty of an item in the shop GUI.
     */
    type DifficultyLabel = Frame & {
        ImageLabel: ImageLabel;
        TextLabel: TextLabel;
    };
}

/**
 * The main GUI for the shop, containing a filter tab and an item list container.
 */
export const SHOP_GUI = (function () {
    const shopGui = ASSETS.ShopWindow.ShopGui.Clone();
    shopGui.ResetOnSpawn = false;
    shopGui.Parent = PLAYER_GUI;
    return shopGui;
})();

/**
 * The main purchase window for the shop, which displays item details and allows purchasing.
 */
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
        PurchaseContainer: Frame & {
            Purchase: TextButton & {
                Price: Frame;
                HeadingLabel: TextLabel;
                UIStroke: UIStroke;
            };
        };
    };

};

/**
 * The metadata for each item in the shop, used to display additional information.
 */
const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 21, "Medium"));
}

@Controller()
export default class ShopController implements OnInit, OnStart {

    readonly sufficientColor = Color3.fromRGB(255, 255, 255);
    readonly insufficientColor = Color3.fromRGB(255, 80, 80);
    readonly descriptionColor = PURCHASE_WINDOW.DescriptionFrame.DescriptionLabel.TextColor3;

    readonly filterItems = ItemFilter.loadFilterOptions(SHOP_GUI.FilterOptions, (query, whitelistedTraits) => {
        const items = this.currentShop?.items;
        if (items === undefined)
            return;
        ItemSlot.filterItems(this.itemSlotsPerItem, items, query, whitelistedTraits);
    });

    itemSlotsPerItem = new Map<Item, ItemSlot>();
    selectedItem = undefined as Item | undefined;

    shopGuiPart: Part | undefined;
    currentShop: Shop | undefined;
    currencyIndexPerItem = new Map<Item, number>();
    priceContainerCounter = 0;
    availableContainerSpace = 0;
    hideMaxedItems: boolean | undefined;
    switchDebounce = 0;

    constructor(private hotkeysController: HotkeysController, private uiController: UIController,
        private adaptiveTabController: AdaptiveTabController, private tooltipController: TooltipController) {

    }

    hideShopGuiPart(shopGuiPart: Part) {
        TweenService.Create(shopGuiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 1 }).Play();
    }

    refreshShop(shopGuiPart?: Part, shop?: Shop) {
        if (shopGuiPart !== undefined && this.shopGuiPart === shopGuiPart)
            return;

        const previousShopGuiPart = this.shopGuiPart;
        if (previousShopGuiPart !== undefined && previousShopGuiPart !== shopGuiPart) {
            this.hideShopGuiPart(previousShopGuiPart);
        }

        this.shopGuiPart = shopGuiPart;
        this.currentShop = shop;

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
        const update = (affordable: boolean) => {
            option.AmountLabel.TextColor3 = affordable ? this.sufficientColor : this.insufficientColor;
            option.SetAttribute("Affordable", affordable);
        };

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
                update(inBalance !== undefined && (amount as OnoeNum).lessEquals(inBalance));
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
                update(inInventory !== undefined && inInventory >= (amount as number));
            });
        }
        option.Destroying.Once(() => connection.disconnect());
        this.assignContainer(option);
        return option;
    }

    assignContainer(priceOption: typeof ASSETS.ShopWindow.PriceOption) {
        const purchaseButton = PURCHASE_WINDOW.DescriptionFrame.PurchaseContainer.Purchase;

        priceOption.Parent = purchaseButton.Price;
        const size = priceOption.AbsoluteSize.X + 5;
        let currentContainer = purchaseButton.Price.FindFirstChild(this.priceContainerCounter) as typeof ASSETS.ShopWindow.PriceOptionsContainer | undefined;
        if (currentContainer === undefined || this.availableContainerSpace < size) {
            currentContainer = ASSETS.ShopWindow.PriceOptionsContainer.Clone();
            currentContainer.Name = tostring(++this.priceContainerCounter);
            currentContainer.Parent = purchaseButton.Price;
            this.availableContainerSpace = currentContainer.AbsoluteSize.X + 5;
        }
        this.availableContainerSpace -= size;
        priceOption.Parent = currentContainer;
    }

    refreshPurchaseWindow(item: Item) {
        const purchaseButton = PURCHASE_WINDOW.DescriptionFrame.PurchaseContainer.Purchase;
        const itemSlot = PURCHASE_WINDOW.ItemSlot;
        const identification = itemSlot.Contents.Identification;
        const viewportFrame = itemSlot.Contents.ViewportFrame;

        const inventory = Packets.inventory.get();
        const bought = Packets.bought.get();
        const placed = Packets.placedItems.get();
        if (inventory === undefined || bought === undefined || placed === undefined)
            return;

        this.selectedItem = item;

        identification.TitleLabel.Text = item.name ?? "error";

        ItemSlot.loadDifficultyLabel(identification.Difficulty, item.difficulty);
        ItemSlot.colorItemSlot(itemSlot, item.difficulty);

        const [invCount, placedCount] = ItemCounter.getAmounts(inventory, placed, item.id);
        itemSlot.AmountLabel.Text = `Owned ${invCount + placedCount}`;

        viewportFrame.ClearAllChildren();
        ItemSlot.loadViewportFrame(viewportFrame, item);
        for (const option of purchaseButton.Price.GetChildren()) {
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

            purchaseButton.Visible = true;
        }
        else {
            purchaseButton.Visible = false;
        }

        PURCHASE_WINDOW.DescriptionFrame.CreatorLabel.Text = `Creator: ${item.creator}`;

        const builder = buildRichText(undefined, item.format(item.description), this.descriptionColor, 21, "Medium");
        builder.appendAll(METADATA_PER_ITEM.get(item)!.builder);
        PURCHASE_WINDOW.DescriptionFrame.DescriptionLabel.Text = builder.toString();
        purchaseButton.Visible = price !== undefined;
        PURCHASE_WINDOW.DescriptionFrame.CreatorLabel.Visible = item.creator !== undefined;
        this.switchDebounce = tick();
    }

    hidePurchaseWindow() {
        if (PURCHASE_WINDOW.Visible === false)
            return false;

        this.adaptiveTabController.hideAdaptiveTab();
        this.selectedItem = undefined;
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
            const getCurrencyAtIndex = () => {
                let currencyIndex = 0;
                const index = this.currencyIndexPerItem.get(item);
                for (const [iCurrency, iAmount] of price.amountPerCurrency) {
                    if (currencyIndex === 0) {
                        firstCurrency = iCurrency;
                        firstAmount = iAmount;
                    }
                    if (index === undefined || currencyIndex === index + 1) {
                        this.currencyIndexPerItem.set(item, currencyIndex);
                        amount = iAmount;
                        return iCurrency;
                    }
                    ++currencyIndex;
                }
                this.currencyIndexPerItem.set(item, 0);
                amount = firstAmount;
                return firstCurrency;
            };
            const currency = getCurrencyAtIndex();
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
            if (this.selectedItem === undefined)
                return;
            this.refreshPurchaseWindow(this.selectedItem);
        });

        const purchaseButton = PURCHASE_WINDOW.DescriptionFrame.PurchaseContainer.Purchase;
        this.hotkeysController.setHotkey(purchaseButton, Enum.KeyCode.E, () => {
            if (!SHOP_GUI.Enabled) {
                return false;
            }
            this.uiController.playSound(this.selectedItem !== undefined && Packets.buyItem.invoke(this.selectedItem.id) ? "Coins" : "Error");
            return true;
        }, "Buy", 1);

        this.hotkeysController.setHotkey(SHOP_GUI.ItemList.BuyAll.Button, Enum.KeyCode.O, () => {
            if (SHOP_GUI.Enabled && this.currentShop !== undefined) {
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
        let elapsedTime = 0;
        RunService.BindToRenderStep("Shop CurrencyBundle Cycle", 1, (dt) => {
            elapsedTime += dt;
            if (elapsedTime < 2) {
                return;
            }
            elapsedTime = 0;
            this.priceCycle();
        });

        task.spawn(() => {
            const purchaseButton = PURCHASE_WINDOW.DescriptionFrame.PurchaseContainer.Purchase;
            const headingLabel = purchaseButton.HeadingLabel;

            while (task.wait(1 / 60)) {
                let affordable = true;
                for (const descendant of purchaseButton.Price.GetDescendants()) {
                    if (descendant.Name === "PriceOption" && descendant.GetAttribute("Affordable") === false) {
                        affordable = false;
                        break;
                    }
                }

                const color = affordable ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(56, 176, 84);
                const tweenInfo = new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
                TweenService.Create(purchaseButton, tweenInfo, { BackgroundColor3: color }).Play();
                TweenService.Create(purchaseButton.UIStroke, tweenInfo, { Color: color }).Play();
                headingLabel.Text = affordable ? "PURCHASE" : "UNAFFORDABLE";
            }
        });

        task.spawn(() => {
            while (task.wait(0.1)) {
                const primaryPart = LOCAL_PLAYER.Character?.PrimaryPart;
                if (primaryPart === undefined)
                    continue;

                const shopHitboxes = CollectionService.GetTagged("Shop");
                let shopFound = false;
                for (const shopHitbox of shopHitboxes) {
                    if (!shopHitbox.IsA("Part"))
                        continue;
                    const shopModel = shopHitbox.Parent;
                    if (shopModel === undefined || shopModel.GetAttribute("Selected"))
                        continue;

                    const shopGuiPart = shopModel.FindFirstChild("ShopGuiPart") as Part | undefined;
                    if (shopGuiPart === undefined)
                        continue;

                    if (shopGuiPart.GetAttribute("ClientLoaded") !== true) {
                        this.hideShopGuiPart(shopGuiPart);
                        shopGuiPart.SetAttribute("ClientLoaded", true);
                    }

                    const localPosition = shopHitbox.CFrame.PointToObjectSpace(primaryPart.Position);
                    if (math.abs(localPosition.X) > shopHitbox.Size.X / 2 || math.abs(localPosition.Z) > shopHitbox.Size.Z / 2)
                        continue;

                    const itemId = shopModel.GetAttribute("ItemId") as string | undefined;
                    if (itemId === undefined)
                        continue;

                    const item = Items.getItem(itemId);
                    if (item === undefined)
                        continue;

                    this.refreshShop(shopGuiPart, item.trait(Shop));
                    shopFound = true;
                    break;
                }

                if (shopFound === false) {
                    this.refreshShop();
                }
            }
        });
    }
}