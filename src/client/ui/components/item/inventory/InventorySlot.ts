/**
 * @fileoverview Shared helpers for creating and managing inventory item slot UI elements.
 */

import { PARALLEL } from "client/constants";
import { loadItemIntoViewport } from "client/ui/components/item/ItemViewport";
import { TooltipManager } from "client/ui/components/tooltip/TooltipWindow";
import { RobotoSlab } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import type Item from "shared/item/Item";

export type InventorySlotHandle = {
    item: Item;
    button: TextButton;
    amountLabel: TextLabel;
    stroke: UIStroke;
    viewportFrame?: ViewportFrame;
    imageLabel?: ImageLabel;
    connections: RBXScriptConnection[];
    currentUuid?: string;
    lastViewportManagement?: ItemViewportManagement;
    lastActor?: Actor;
    tooltipEnabled: boolean;
    destroyed?: boolean;
    destroy(): void;
};

export interface CreateInventorySlotOptions {
    parent: GuiObject;
    size: UDim2;
    layoutOrder?: number;
    visible?: boolean;
    tooltip?: boolean;
    viewportManagement?: ItemViewportManagement;
    actor?: Actor;
    onActivated: (item: Item) => void;
}

export interface UpdateInventorySlotOptions {
    parent?: GuiObject;
    size?: UDim2;
    layoutOrder?: number;
    visible?: boolean;
    amount?: number;
    uuid?: string;
    viewportManagement?: ItemViewportManagement;
    actor?: Actor;
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
        tooltip = true,
        viewportManagement,
        actor = PARALLEL,
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
        loadItemIntoViewport(actor, viewportFrame, item.id, viewportManagement);
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
        viewportFrame,
        imageLabel,
        connections,
        tooltipEnabled: tooltip,
        lastViewportManagement: viewportManagement,
        lastActor: actor,
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
                TooltipManager.showTooltip({ item, uuid: handle.currentUuid });
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

    const { parent, size, layoutOrder, visible, amount, uuid, viewportManagement, actor } = options;

    if (parent && handle.button.Parent !== parent) {
        handle.button.Parent = parent;
    }

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
        handle.amountLabel.Text = tostring(amount);
        handle.amountLabel.TextColor3 = amount > 0 ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);
    }

    handle.currentUuid = uuid;

    const backgroundColor = handle.item.difficulty.color ?? Color3.fromRGB(52, 155, 255);
    handle.button.BackgroundColor3 = backgroundColor;
    handle.stroke.Color = backgroundColor;

    const nextViewportManagement = viewportManagement ?? handle.lastViewportManagement;
    const nextActor = actor ?? handle.lastActor ?? PARALLEL;

    if (handle.viewportFrame) {
        if (nextViewportManagement !== handle.lastViewportManagement || nextActor !== handle.lastActor) {
            loadItemIntoViewport(nextActor, handle.viewportFrame, handle.item.id, nextViewportManagement);
            handle.lastViewportManagement = nextViewportManagement;
            handle.lastActor = nextActor;
        }
    } else if (handle.imageLabel) {
        handle.imageLabel.Image = handle.item.image ?? "";
    }
}
