/**
 * @fileoverview Shared helpers for creating and managing inventory item slot UI elements.
 */

import ItemViewport from "shared/item/ItemViewport";
import { TooltipManager } from "client/components/tooltip/TooltipWindow";
import { getAsset } from "shared/asset/AssetMap";
import { RobotoSlab } from "shared/asset/GameFonts";
import type Item from "shared/item/Item";
import Packets from "shared/Packets";

export type InventorySlotHandle = {
    item: Item;
    button: TextButton;
    amountLabel: TextLabel;
    stroke: UIStroke;
    viewportLoaded: boolean;
    viewportFrame?: ViewportFrame;
    imageLabel?: ImageLabel;
    connections: RBXScriptConnection[];
    currentUuid?: string;
    tooltipEnabled: boolean;
    destroyed?: boolean;
    destroy(): void;
};

export interface CreateInventorySlotOptions {
    parent: GuiObject;
    size: UDim2;
    viewportsEnabled?: boolean;
    layoutOrder?: number;
    visible?: boolean;
    tooltip?: boolean;
    onActivated: (item: Item) => void;
}

export interface UpdateInventorySlotOptions {
    size?: UDim2;
    layoutOrder?: number;
    visible?: boolean;
    amount?: number;
    bonusAmount?: number;
    uuid?: string;
}

function createGradient(colorSequence: ColorSequence, parent: Instance) {
    const gradient = new Instance("UIGradient");
    gradient.Color = colorSequence;
    gradient.Parent = parent;
    return gradient;
}

function createStroke(parent: GuiObject, color: Color3) {
    const stroke = new Instance("UIStroke");
    stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
    stroke.Color = color;
    stroke.Thickness = 2;
    stroke.Parent = parent;
    return stroke;
}

export function createInventorySlot(item: Item, options: CreateInventorySlotOptions): InventorySlotHandle {
    const {
        parent,
        size,
        layoutOrder = item.layoutOrder,
        visible = false,
        viewportsEnabled = true,
        tooltip = true,
        onActivated,
    } = options;

    const backgroundColor = item.difficulty.color ?? Color3.fromRGB(52, 155, 255);

    const button = new Instance("TextButton");
    button.Name = `InventorySlot_${item.id}`;
    button.BackgroundColor3 = backgroundColor;
    button.BorderColor3 = Color3.fromRGB(0, 0, 0);
    button.BorderSizePixel = 5;
    button.LayoutOrder = layoutOrder;
    button.Selectable = false;
    button.Size = size;
    button.Text = "";
    button.Visible = visible;
    button.AutoButtonColor = true;
    button.Parent = parent;

    const aspectConstraint = new Instance("UIAspectRatioConstraint");
    aspectConstraint.AspectRatio = 1;
    aspectConstraint.AspectType = Enum.AspectType.ScaleWithParentSize;
    aspectConstraint.DominantAxis = Enum.DominantAxis.Height;
    aspectConstraint.Parent = button;

    const backgroundGradient = createGradient(
        new ColorSequence([
            new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76)),
        ]),
        button,
    );
    backgroundGradient.Rotation = 90;

    const stroke = createStroke(button, backgroundColor);
    const strokeGradient = createGradient(
        new ColorSequence([
            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
            new ColorSequenceKeypoint(0.3, Color3.fromRGB(255, 255, 255)),
            new ColorSequenceKeypoint(0.5, Color3.fromRGB(118, 118, 118)),
            new ColorSequenceKeypoint(0.8, Color3.fromRGB(255, 255, 255)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
        ]),
        stroke,
    );
    strokeGradient.Rotation = 35;

    const amountLabel = new Instance("TextLabel");
    amountLabel.Name = "AmountLabel";
    amountLabel.Active = true;
    amountLabel.AnchorPoint = new Vector2(0.5, 0.5);
    amountLabel.AutomaticSize = Enum.AutomaticSize.X;
    amountLabel.BackgroundTransparency = 1;
    amountLabel.FontFace = RobotoSlab;
    amountLabel.Position = new UDim2(0.5, 0, 0.9, 0);
    amountLabel.Size = new UDim2(0.6, 0, 0.4, 0);
    amountLabel.Text = "0";
    amountLabel.TextColor3 = Color3.fromRGB(150, 150, 150);
    amountLabel.TextScaled = true;
    amountLabel.TextSize = 14;
    amountLabel.TextWrapped = true;
    amountLabel.TextXAlignment = Enum.TextXAlignment.Right;
    amountLabel.Parent = button;

    const amountStroke = new Instance("UIStroke");
    amountStroke.Thickness = 2;
    amountStroke.Parent = amountLabel;

    const reflection = new Instance("ImageLabel");
    reflection.Name = "Reflection";
    reflection.AnchorPoint = new Vector2(0.5, 0.5);
    reflection.BackgroundTransparency = 1;
    reflection.Image = getAsset("assets/Grid.png");
    reflection.ImageColor3 = Color3.fromRGB(126, 126, 126);
    reflection.ImageTransparency = 0.85;
    reflection.Position = new UDim2(0.5, 0, 0.5, 0);
    reflection.ScaleType = Enum.ScaleType.Tile;
    reflection.Size = new UDim2(1, 0, 1, 0);
    reflection.TileSize = new UDim2(0.5, 0, 0.5, 0);
    reflection.ZIndex = -5;
    reflection.Parent = button;

    let viewportFrame: ViewportFrame | undefined;
    let imageLabel: ImageLabel | undefined;

    if (item.image !== undefined) {
        imageLabel = new Instance("ImageLabel");
        imageLabel.AnchorPoint = new Vector2(0.5, 0.5);
        imageLabel.BackgroundTransparency = 1;
        imageLabel.Image = item.image;
        imageLabel.Position = new UDim2(0.5, 0, 0.5, 0);
        imageLabel.Size = new UDim2(0.8, 0, 0.8, 0);
        imageLabel.ZIndex = 0;
        imageLabel.Parent = button;
    } else {
        viewportFrame = new Instance("ViewportFrame");
        viewportFrame.AnchorPoint = new Vector2(0.5, 0.5);
        viewportFrame.BackgroundTransparency = 1;
        viewportFrame.Position = new UDim2(0.5, 0, 0.5, 0);
        viewportFrame.Size = new UDim2(0.8, 0, 0.8, 0);
        viewportFrame.ZIndex = 0;
        viewportFrame.Parent = button;
        ItemViewport.loadItemIntoViewport(viewportFrame, item.id);
    }

    const overlay = new Instance("ImageLabel");
    overlay.Name = "Overlay";
    overlay.BackgroundTransparency = 1;
    overlay.Image = getAsset("assets/Vignette.png");
    overlay.ImageTransparency = 0.2;
    overlay.Size = new UDim2(1, 0, 1, 0);
    overlay.ZIndex = -4;
    overlay.Parent = button;

    const connections = new Array<RBXScriptConnection>();

    const handle: InventorySlotHandle = {
        item,
        button,
        amountLabel,
        stroke,
        viewportLoaded: !viewportsEnabled,
        viewportFrame,
        imageLabel,
        connections,
        tooltipEnabled: tooltip,
        destroy() {
            if (this.destroyed) return;
            this.destroyed = true;
            for (const connection of connections) {
                connection.Disconnect();
            }
            if (this.tooltipEnabled) {
                TooltipManager.hideTooltip();
            }
            button.Destroy();
        },
    };

    connections.push(
        button.Activated.Connect(() => {
            onActivated(item);
        }),
    );

    if (tooltip) {
        connections.push(
            button.MouseEnter.Connect(() => {
                if (!button.Visible) return;
                const uuid = handle.currentUuid;
                if (uuid) {
                    const uniqueInstance = Packets.uniqueInstances.get().get(uuid);
                    TooltipManager.showTooltip({ item, uniqueInstance });
                } else {
                    TooltipManager.showTooltip({ item });
                }
            }),
        );

        connections.push(
            button.MouseLeave.Connect(() => {
                TooltipManager.hideTooltip();
            }),
        );

        connections.push(
            button.Destroying.Connect(() => {
                TooltipManager.hideTooltip();
            }),
        );
    }

    return handle;
}

export function updateInventorySlot(handle: InventorySlotHandle, options: UpdateInventorySlotOptions) {
    if (handle.destroyed) return;

    const { size, layoutOrder, visible, amount, uuid } = options;

    if (size) {
        handle.button.Size = size;
    }

    if (layoutOrder !== undefined) {
        handle.button.LayoutOrder = layoutOrder;
    }

    if (visible !== undefined) {
        const wasVisible = handle.button.Visible;
        handle.button.Visible = visible;
        if (wasVisible && !visible && handle.tooltipEnabled) {
            TooltipManager.hideTooltip();
        }
    }

    if (amount !== undefined) {
        const bonusAmount = options.bonusAmount ?? 0;
        const displayText = bonusAmount > 0 ? `${amount}+${bonusAmount}` : tostring(amount);
        handle.amountLabel.Text = displayText;
        const totalAmount = amount + bonusAmount;
        handle.amountLabel.TextColor3 = totalAmount > 0 ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);
    }

    handle.currentUuid = uuid;

    const backgroundColor = handle.item.difficulty.color ?? Color3.fromRGB(52, 155, 255);
    handle.button.BackgroundColor3 = backgroundColor;
    handle.stroke.Color = backgroundColor;

    if (handle.viewportFrame && !handle.viewportLoaded) {
        handle.viewportLoaded = true;
        ItemViewport.loadItemIntoViewport(handle.viewportFrame, handle.item.id);
    } else if (handle.imageLabel) {
        handle.imageLabel.Image = handle.item.image ?? "";
    }
}
