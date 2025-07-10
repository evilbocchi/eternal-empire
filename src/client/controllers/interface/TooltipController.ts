
/**
 * @fileoverview TooltipController - Client controller responsible for managing and displaying tooltips in the user interface.
 * 
 * It provides logic for showing item or message tooltips, animating their appearance/disappearance, and formatting item descriptions with metadata and currency highlighting.
 * The Tooltip class encapsulates tooltip data and rendering logic, supporting both generic messages and item-specific tooltips with rich formatting.
 *
 * The controller maintains a mapping between GUI objects and their tooltips, and hooks into mouse events to show/hide tooltips as needed.
 * It also processes item descriptions to highlight currencies and hooks item metadata for display.
 */

import { buildRichText } from "@antivivi/vrldk";
import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { TweenService, Workspace } from "@rbxts/services";
import ItemSlot from "client/ItemSlot";
import { MOUSE } from "client/constants";
import { INTERFACE } from "client/controllers/core/UIController";
import Packets from "shared/Packets";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Unique from "shared/item/traits/Unique";
import Items from "shared/items/Items";

/**
 * Tooltip window UI reference, including all subcomponents.
 */
export const TOOLTIP_WINDOW = INTERFACE.WaitForChild("TooltipWindow") as Frame & {
    UIStroke: UIStroke;
    MessageLabel: TextLabel;
    ItemSlot: ItemSlot & {
        UIPadding: UIPadding;
        Difficulty: Frame & {
            ImageLabel: ImageLabel;
            TextLabel: TextLabel;
        };
        MessageLabel: TextLabel;
        TitleLabel: TextLabel;
    };
};

// Precompute item metadata for all items for efficient tooltip rendering.
const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 16, "Bold"));
}

/**
 * Tooltip encapsulates the data and rendering logic for a tooltip, supporting both generic messages and item-specific tooltips.
 */
export class Tooltip {
    /** Tooltip message (if not item-based). */
    message = "";
    /** Item to display in the tooltip, if any. */
    item: Item | undefined;
    /** Precomputed metadata for the item, if any. */
    metadata: ItemMetadata | undefined;
    /** UUID for unique item instances, if any. */
    uuid?: string;

    /**
     * Create a Tooltip from a plain message string.
     * 
     * @param message The message to display.
     * @returns Tooltip instance.
     */
    static fromMessage(message: string) {
        const tooltip = new Tooltip();
        tooltip.message = message;
        return tooltip;
    }

    /**
     * Create a Tooltip for a specific item, using precomputed metadata.
     * 
     * @param item The item to display.
     * @returns Tooltip instance.
     */
    static fromItem(item: Item) {
        const tooltip = new Tooltip();
        tooltip.item = item;
        tooltip.metadata = METADATA_PER_ITEM.get(item);
        return tooltip;
    }

    /**
     * Display the tooltip in the UI, formatting item descriptions and handling unique item variants.
     */
    display() {
        const item = this.item;
        const itemSlot = TOOLTIP_WINDOW.ItemSlot;
        TOOLTIP_WINDOW.MessageLabel.Visible = item === undefined;
        itemSlot.Visible = item !== undefined;

        if (item !== undefined) {
            const difficulty = item.difficulty;
            itemSlot.TitleLabel.Text = item.name;

            let description = item.tooltipDescription ?? item.description;

            // Use unique item description if this is a unique item
            if (this.uuid !== undefined) {
                const uniqueInstance = Packets.uniqueInstances.get()?.get(this.uuid);
                if (uniqueInstance !== undefined) {
                    description = item.trait(Unique).formatWithPots(description, uniqueInstance);
                }
            }

            const builder = buildRichText(undefined, item.format(description), Color3.fromRGB(195, 195, 195), 18, "Medium");
            builder.appendAll(this.metadata!.builder);
            itemSlot.MessageLabel.Text = builder.toString();

            ItemSlot.loadDifficultyLabel(itemSlot.Difficulty, difficulty);
            ItemSlot.colorItemSlot(itemSlot, difficulty);
            return;
        }

        TOOLTIP_WINDOW.MessageLabel.Text = this.message;
    }
}

/**
 * Manages the display and animation of tooltips for GUI objects in the client interface.
 * It handles mouse events to show/hide tooltips, formats item descriptions, and updates tooltip positions.
 */
@Controller()
export default class TooltipController implements OnInit, OnPhysics {
    /** Mapping of GUI objects to their tooltips. */
    tooltipsPerObject = new Map<GuiObject, Tooltip>();

    /**
     * Animate and hide the tooltip window.
     */
    hideTooltipWindow() {
        const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear, Enum.EasingDirection.In);
        const tween = TweenService.Create(TOOLTIP_WINDOW, tweenInfo, { BackgroundTransparency: 1 });
        TweenService.Create(TOOLTIP_WINDOW.MessageLabel, tweenInfo, { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
        TweenService.Create(TOOLTIP_WINDOW.UIStroke, tweenInfo, { Transparency: 1 }).Play();

        TweenService.Create(TOOLTIP_WINDOW.ItemSlot.UIPadding, tweenInfo,
            { PaddingTop: new UDim(0, 5), PaddingBottom: new UDim(0, 5) }).Play();

        tween.Play();
        tween.Completed.Connect(() => TOOLTIP_WINDOW.Visible = false);
    }

    /**
     * Animate and show the tooltip window.
     */
    showTooltipWindow() {
        const tweenInfo = new TweenInfo(0.2);
        TOOLTIP_WINDOW.Visible = true;
        TweenService.Create(TOOLTIP_WINDOW, tweenInfo, { BackgroundTransparency: 0.5 }).Play();
        TweenService.Create(TOOLTIP_WINDOW.UIStroke, tweenInfo, { Transparency: 0.5 }).Play();
        TweenService.Create(TOOLTIP_WINDOW.MessageLabel, tweenInfo, { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();

        TweenService.Create(TOOLTIP_WINDOW.ItemSlot.UIPadding,
            new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out),
            { PaddingTop: new UDim(0, 10), PaddingBottom: new UDim(0, 10) }).Play();
    }

    /**
     * Get or create a Tooltip instance for a given GUI object.
     * 
     * @param guiObject The GUI object to get a tooltip for.
     * @returns Tooltip instance.
     */
    getTooltip(guiObject: GuiObject) {
        const cached = this.tooltipsPerObject.get(guiObject);
        if (cached !== undefined) {
            return cached;
        }
        const tooltip = new Tooltip();
        this.setTooltip(guiObject, tooltip);
        return tooltip;
    }

    /**
     * Associate a Tooltip with a GUI object and hook up mouse events for tooltip display.
     * 
     * @param guiObject The GUI object to associate.
     * @param tooltip The Tooltip instance to associate.
     */
    setTooltip(guiObject: GuiObject, tooltip: Tooltip) {
        if (!this.tooltipsPerObject.has(guiObject)) {
            guiObject.MouseMoved.Connect(() => {
                this.showTooltipWindow();
            });
            guiObject.MouseEnter.Connect(() => {
                this.showTooltipWindow();
                this.getTooltip(guiObject).display();
            });
            guiObject.MouseLeave.Connect(() => {
                this.hideTooltipWindow();
            });
        }
        this.tooltipsPerObject.set(guiObject, tooltip);
    }

    /**
     * Set a plain message as the tooltip for a GUI object.
     * 
     * @param guiObject The GUI object to set a message for.
     * @param message The message to display.
     */
    setMessage(guiObject: GuiObject, message: string) {
        this.getTooltip(guiObject).message = message;
    }

    /**
     * Update the tooltip window's position based on the mouse and viewport size.
     */
    onPhysics() {
        const canvasSize = Workspace.CurrentCamera?.ViewportSize;
        if (canvasSize !== undefined) {
            TOOLTIP_WINDOW.AnchorPoint = new Vector2(canvasSize.X - MOUSE.X < 200 ? 1 : 0, canvasSize.Y - MOUSE.Y < 200 ? 1 : 0);
            TOOLTIP_WINDOW.Position = UDim2.fromOffset(MOUSE.X + 5, MOUSE.Y + 36);
        }
    }

    /**
     * Initialize the controller, hiding the tooltip window and formatting item descriptions with currency highlighting.
     */
    onInit() {
        this.hideTooltipWindow();

        for (const [_id, item] of Items.itemsPerId) {
            let description = item.description;
            if (description !== undefined) {
                for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
                    [description] = description!.gsub(currency, `<font color="#${details.color.ToHex()}">${currency}</font>`);
                }
                item.description = description;
            }
        }

        ItemSlot.hookMetadata(METADATA_PER_ITEM);
    }
}