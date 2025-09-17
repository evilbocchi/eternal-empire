//!native
/**
 * @fileoverviewgame shop interface and item purchasing logic.
 *
 * Handles:
 * - Displaying and filtering shop items
 * - Managing the purchase window and item details
 * - Animating shop GUI elements and purchase feedback
 * - Handling hotkeys for buying items
 * - Observing inventory, settings, and shop state for live updates
 *
 * The controller maintains mappings between items and their GUI slots, manages price cycling for multi-currency items, and coordinates with other controllers for UI and hotkey integration.
 *
 * @since 1.0.0
 */

import { Connection } from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { buildRichText } from "@antivivi/vrldk";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { CollectionService, Debris, RunService, TweenService } from "@rbxts/services";
import ItemFilter from "client/ItemFilter";
import ItemSlot from "client/ItemSlot";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import AdaptiveTabController, {
    ADAPTIVE_TAB,
    ADAPTIVE_TAB_MAIN_WINDOW,
} from "client/controllers/core/AdaptiveTabController";
import HotkeysController from "client/controllers/core/HotkeysController";
import { IS_STUDIO } from "shared/Context";
import Packets from "shared/Packets";
import { ASSETS, getSound, playSound } from "shared/asset/GameAssets";
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
 * The metadata for each item in the shop, used to display additional information.
 */
const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 21, "Medium"));
}

/**
 * Controller responsible for managing the in-game shop interface, item display, and purchase logic.
 *
 * Handles shop GUI state, item slot management, purchase window updates, price cycling, and hotkey integration.
 * Observes inventory and settings for live updates, and coordinates with other controllers for UI and hotkey actions.
 */
@Controller()
export default class ShopController implements OnInit, OnStart {
    /** Item filter logic for the shop GUI. */
    readonly filterItems = ItemFilter.loadFilterOptions(SHOP_GUI.FilterOptions, (query, whitelistedTraits) => {
        const items = this.currentShop?.items;
        if (items === undefined) return;
        ItemSlot.filterItems(this.itemSlotsPerItem, items, query, whitelistedTraits);
    });

    /** Mapping of items to their GUI slots. */
    itemSlotsPerItem = new Map<Item, ItemSlot>();
    /** Currently selected item in the shop. */
    selectedItem = undefined as Item | undefined;

    /** The current shop GUI part being displayed. */
    shopGuiPart: Part | undefined;
    /** The current shop data. */
    currentShop: Shop | undefined;
    /** Tracks which currency index is shown for each item. */
    currencyIndexPerItem = new Map<Item, number>();
    /** Counter for price containers. */
    priceContainerCounter = 0;
    /** Remaining space in the current price container. */
    availableContainerSpace = 0;
    /** Whether to hide maxed items. */
    hideMaxedItems: boolean | undefined;
    /** Debounce for switching items. */
    switchDebounce = 0;

    constructor(
        private hotkeysController: HotkeysController,
        private adaptiveTabController: AdaptiveTabController,
    ) {}

    /**
     * Animates and hides the shop GUI part.
     * @param shopGuiPart The shop GUI part to hide.
     */
    hideShopGuiPart(shopGuiPart: Part) {
        TweenService.Create(shopGuiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 1 }).Play();

        const sound = getSound("ShopClose.mp3");
        sound.Play();
        sound.Parent = shopGuiPart;
        Debris.AddItem(sound, 5);
    }

    /**
     * Refreshes the shop interface and updates the displayed shop and items.
     * @param shopGuiPart The shop GUI part to display.
     * @param shop The shop data to display.
     */
    refreshShop(shopGuiPart?: Part, shop?: Shop) {
        if (shopGuiPart !== undefined && this.shopGuiPart === shopGuiPart) return;

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

        const sound = getSound("ShopOpen.mp3");
        sound.Play();
        sound.Parent = shopGuiPart;
        Debris.AddItem(sound, 5);

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

    /**
     * Loads item slots for all items in the shop.
     */
    loadItemSlots() {
        for (const [_id, item] of Items.itemsPerId) {
            const itemSlot = ItemSlot.loadItemSlot(ASSETS.ShopWindow.ItemSlot.Clone(), item);
            const diff = item.difficulty;
            if (diff === undefined) {
                error("No difficulty found");
            }
            itemSlot.Visible = false;
            itemSlot.Activated.Connect(() => {
                playSound("MenuClick.mp3");
                //this.refreshPurchaseWindow(item);
                this.adaptiveTabController.showAdaptiveTab("Purchase");
                ADAPTIVE_TAB.UIStroke.Color = diff.color ?? Color3.fromRGB(255, 255, 255);
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
        if (bought === undefined) return;
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
                TweenService.Create(itemSlot.AmountLabel, new TweenInfo(0.5), {
                    TextColor3: CURRENCY_DETAILS[currency].color,
                }).Play();
            }
        }
    }

    /**
     * Initializes the ShopController, sets up observers, and loads item slots.
     */
    onInit() {
        this.refreshShop();

        Packets.settings.observe((settings) => {
            if (settings.HideMaxedItems === this.hideMaxedItems) return;
            this.hideMaxedItems = settings.HideMaxedItems;
        });

        this.hotkeysController.setHotkey(
            SHOP_GUI.ItemList.BuyAll.Button,
            Enum.KeyCode.O,
            () => {
                if (SHOP_GUI.Enabled && this.currentShop !== undefined) {
                    const items = new Array<string>();
                    for (const [item, slot] of this.itemSlotsPerItem) {
                        if (slot.Visible === false) continue;
                        items.push(item.id);
                    }
                    if (Packets.buyAllItems.toServer(items)) {
                        playSound("ItemPurchase.mp3");
                    } else {
                        playSound("Error.mp3");
                    }
                    return true;
                }
                return false;
            },
            "Buy All Items",
            5,
        );

        ItemSlot.hookMetadata(METADATA_PER_ITEM);

        this.loadItemSlots();
    }

    /**
     * Starts the ShopController, binds render steps for price cycling and shop detection.
     */
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
            while (task.wait(0.1)) {
                const primaryPart = LOCAL_PLAYER.Character?.PrimaryPart;
                if (primaryPart === undefined) continue;

                const shopHitboxes = CollectionService.GetTagged("Shop");
                let shopFound = false;
                for (const shopHitbox of shopHitboxes) {
                    if (!shopHitbox.IsA("Part")) continue;
                    const shopModel = shopHitbox.Parent;
                    if (shopModel === undefined || shopModel.GetAttribute("Selected")) continue;

                    const shopGuiPart = shopModel.FindFirstChild("ShopGuiPart") as Part | undefined;
                    if (shopGuiPart === undefined) continue;

                    if (shopGuiPart.GetAttribute("ClientLoaded") !== true) {
                        this.hideShopGuiPart(shopGuiPart);
                        shopGuiPart.SetAttribute("ClientLoaded", true);
                    }

                    const localPosition = shopHitbox.CFrame.PointToObjectSpace(primaryPart.Position);
                    if (
                        math.abs(localPosition.X) > shopHitbox.Size.X / 2 ||
                        math.abs(localPosition.Z) > shopHitbox.Size.Z / 2
                    )
                        continue;

                    const itemId = shopModel.GetAttribute("ItemId") as string | undefined;
                    if (itemId === undefined) continue;

                    const item = Items.getItem(itemId);
                    if (item === undefined) continue;

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
