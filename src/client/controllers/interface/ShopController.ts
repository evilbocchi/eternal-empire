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

import { Controller, OnStart } from "@flamework/core";
import { CollectionService, Debris, TweenService } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { SHOP_GUI } from "client/controllers/core/Guis";
import { ShopManager } from "client/ui/components/item/shop/ShopWindow";
import { getSound } from "shared/asset/GameAssets";
import eat from "shared/hamster/eat";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";

/**
 * Controller responsible for managing the in-game shop interface, item display, and purchase logic.
 *
 * Handles shop GUI state, item slot management, purchase window updates, price cycling, and hotkey integration.
 * Observes inventory and settings for live updates, and coordinates with other controllers for UI and hotkey actions.
 */
@Controller()
export default class ShopController implements OnStart {
    /** The current shop GUI part being displayed. */
    shopGuiPart: Part | undefined;
    /** The current shop data. */
    currentShop: Shop | undefined;

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

    private checkForShop() {
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
    }

    /**
     * Starts the ShopController, binds render steps for price cycling and shop detection.
     */
    onStart() {
        this.refreshShop();

        let active = true;
        const loop = () => {
            if (active === false) return;
            this.checkForShop();
            task.delay(0.1, loop);
        };
        loop();
        eat(() => {
            active = false;
        });
    }
}
