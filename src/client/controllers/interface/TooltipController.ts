import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { TweenService, Workspace } from "@rbxts/services";
import { MOUSE } from "client/constants";
import { INTERFACE } from "client/controllers/UIController";
import ItemSlot from "client/ItemSlot";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Items from "shared/items/Items";
import { buildRichText } from "@antivivi/vrldk";

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

const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 16, "Bold"));
}

export class Tooltip {

    message = "";
    item: Item | undefined;
    metadata: ItemMetadata | undefined;

    static fromMessage(message: string) {
        const tooltip = new Tooltip();
        tooltip.message = message;
        return tooltip;
    }

    static fromItem(item: Item) {
        const tooltip = new Tooltip();
        tooltip.item = item;
        tooltip.metadata = METADATA_PER_ITEM.get(item);
        return tooltip;
    }

    display() {
        const item = this.item;
        const itemSlot = TOOLTIP_WINDOW.ItemSlot;
        TOOLTIP_WINDOW.MessageLabel.Visible = item === undefined;
        itemSlot.Visible = item !== undefined;

        if (item !== undefined) {
            const difficulty = item.difficulty;
            itemSlot.TitleLabel.Text = item.name;

            const builder = buildRichText(undefined, item.format(item.description), Color3.fromRGB(195, 195, 195), 18, "Medium");
            builder.appendAll(this.metadata!.builder);
            itemSlot.MessageLabel.Text = builder.toString();

            ItemSlot.loadDifficultyLabel(itemSlot.Difficulty, difficulty);
            ItemSlot.colorItemSlot(itemSlot, difficulty);
            return;
        }

        TOOLTIP_WINDOW.MessageLabel.Text = this.message;
    }
}

@Controller()
export class TooltipController implements OnInit, OnPhysics {

    tooltipsPerObject = new Map<GuiObject, Tooltip>();

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

    getTooltip(guiObject: GuiObject) {
        const cached = this.tooltipsPerObject.get(guiObject);
        if (cached !== undefined) {
            return cached;
        }
        const tooltip = new Tooltip();
        this.setTooltip(guiObject, tooltip);
        return tooltip;
    }

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

    setMessage(guiObject: GuiObject, message: string) {
        this.getTooltip(guiObject).message = message;
    }

    onPhysics() {
        const canvasSize = Workspace.CurrentCamera?.ViewportSize;
        if (canvasSize !== undefined) {
            TOOLTIP_WINDOW.AnchorPoint = new Vector2(canvasSize.X - MOUSE.X < 200 ? 1 : 0, canvasSize.Y - MOUSE.Y < 200 ? 1 : 0);
            TOOLTIP_WINDOW.Position = UDim2.fromOffset(MOUSE.X + 5, MOUSE.Y + 36);
        }
    }

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