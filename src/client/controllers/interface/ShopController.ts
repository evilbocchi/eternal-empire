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

import { Controller, OnInit, OnStart } from "@flamework/core";
import { CollectionService, Debris, TweenService } from "@rbxts/services";
import ItemSlot from "client/ItemSlot";
import { LOCAL_PLAYER } from "client/constants";
import { SHOP_GUI } from "client/controllers/core/Guis";
import { ShopManager } from "client/ui/components/item/shop/ShopWindow";
import { getSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
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
    /** Whether to hide maxed items. */
    hideMaxedItems: boolean | undefined;
    /** Debounce for switching items. */
    switchDebounce = 0;

    constructor() {}

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
            ShopManager.closeShop();
            return;
        }

        const sound = getSound("ShopOpen.mp3");
        sound.Play();
        sound.Parent = shopGuiPart;
        Debris.AddItem(sound, 5);

        TweenService.Create(shopGuiPart, new TweenInfo(0.3), { LocalTransparencyModifier: 0 }).Play();
        SHOP_GUI.Enabled = true;
        ShopManager.openShop(shop);
    }

    /**
     * Initializes the ShopController, sets up observers, and loads item slots.
     */
    onInit() {
        this.refreshShop();
        ItemSlot.hookMetadata(METADATA_PER_ITEM);
    }

    /**
     * Starts the ShopController, binds render steps for price cycling and shop detection.
     */
    onStart() {
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
