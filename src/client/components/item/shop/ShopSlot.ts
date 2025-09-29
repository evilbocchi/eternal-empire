/**
 * @fileoverview Imperative helpers for creating and updating shop item slots.
 */

import { OnoeNum } from "@antivivi/serikanum";
import { TweenService } from "@rbxts/services";
import displayBalanceCurrency from "client/components/balance/displayBalanceCurrency";
import ItemViewport from "client/components/item/ItemViewport";
import { getAsset } from "shared/asset/AssetMap";
import { RobotoSlabHeavy } from "shared/asset/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

const BUTTON_STROKE_GRADIENT = new ColorSequence([
    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
    new ColorSequenceKeypoint(0.3, Color3.fromRGB(255, 255, 255)),
    new ColorSequenceKeypoint(0.5, Color3.fromRGB(118, 118, 118)),
    new ColorSequenceKeypoint(0.8, Color3.fromRGB(255, 255, 255)),
    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
]);

const BACKGROUND_GRADIENT = new ColorSequence([
    new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)),
    new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76)),
]);

const PRICE_TEXT_TWEEN_INFO = new TweenInfo(0.3, Enum.EasingStyle.Quart, Enum.EasingDirection.Out);

interface CurrencyOption {
    kind: "currency";
    currency: Currency;
    amount: OnoeNum | number;
}

interface ItemOption {
    kind: "item";
    item: Item;
    amount: number;
}

interface MaxedOption {
    kind: "maxed";
}

type PriceOption = CurrencyOption | ItemOption | MaxedOption;

type PriceOptionSequence = Array<CurrencyOption | ItemOption>;

function clampColorComponent(value: number) {
    return math.clamp(value, 0.1, 0.9);
}

function applyStyling(parent: GuiObject, gridTransparency: number) {
    const gradient = new Instance("UIGradient");
    gradient.Color = BACKGROUND_GRADIENT;
    gradient.Rotation = 90;
    gradient.Parent = parent;

    const vignette = new Instance("ImageLabel");
    vignette.Name = "Vignette";
    vignette.BackgroundTransparency = 1;
    vignette.Image = getAsset("assets/Vignette.png");
    vignette.ImageTransparency = 0.2;
    vignette.Size = new UDim2(1, 0, 1, 0);
    vignette.ZIndex = -4;
    vignette.Parent = parent;

    const grid = new Instance("ImageLabel");
    grid.Name = "Grid";
    grid.AnchorPoint = new Vector2(0.5, 0.5);
    grid.BackgroundTransparency = 1;
    grid.Image = getAsset("assets/Grid.png");
    grid.ImageColor3 = Color3.fromRGB(126, 126, 126);
    grid.ImageTransparency = gridTransparency;
    grid.Position = new UDim2(0.5, 0, 0.5, 0);
    grid.ScaleType = Enum.ScaleType.Tile;
    grid.Size = new UDim2(1, 0, 1, 0);
    grid.TileSize = new UDim2(0, 100, 0, 100);
    grid.ZIndex = -5;
    grid.Parent = parent;
}

function createStroke(parent: GuiObject, color: Color3) {
    const stroke = new Instance("UIStroke");
    stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
    stroke.Color = color;
    stroke.Thickness = 2;
    stroke.Parent = parent;

    const strokeGradient = new Instance("UIGradient");
    strokeGradient.Color = BUTTON_STROKE_GRADIENT;
    strokeGradient.Rotation = 35;
    strokeGradient.Parent = stroke;

    return stroke;
}

function tweenPriceColor(handle: ShopSlotHandle, target: Color3, shouldTween: boolean) {
    if (handle.currentTween) {
        handle.currentTween.Cancel();
        handle.currentTween = undefined;
    }

    if (!shouldTween || !handle.root.Visible) {
        handle.priceText.TextColor3 = target;
        return;
    }

    const tween = TweenService.Create(handle.priceText, PRICE_TEXT_TWEEN_INFO, {
        TextColor3: target,
    });
    handle.currentTween = tween;
    tween.Play();
}

function applyPriceOption(handle: ShopSlotHandle, option: PriceOption) {
    if (option.kind === "currency") {
        const details = CURRENCY_DETAILS[option.currency];
        handle.priceImage.Visible = true;
        handle.priceImage.Image = details.image;
        handle.priceViewport.Visible = false;
        handle.currentPriceItemId = undefined;
        handle.priceText.Text = displayBalanceCurrency(option.currency, option.amount);
        const targetColor = new Color3(
            clampColorComponent(details.color.R),
            clampColorComponent(details.color.G),
            clampColorComponent(details.color.B),
        );
        tweenPriceColor(handle, targetColor, true);
        return;
    }

    if (option.kind === "item") {
        handle.priceImage.Visible = option.item.image !== undefined;
        handle.priceViewport.Visible = option.item.image === undefined;
        handle.priceText.Text = tostring(option.amount);

        const itemColor = option.item.difficulty?.color ?? Color3.fromRGB(255, 255, 255);
        const targetColor = new Color3(
            clampColorComponent(itemColor.R),
            clampColorComponent(itemColor.G),
            clampColorComponent(itemColor.B),
        );
        tweenPriceColor(handle, targetColor, true);

        if (option.item.image !== undefined) {
            handle.priceImage.Image = option.item.image;
            handle.currentPriceItemId = undefined;
            return;
        }

        if (handle.currentPriceItemId !== option.item.id) {
            ItemViewport.loadItemIntoViewport(handle.priceViewport, option.item.id);
            handle.currentPriceItemId = option.item.id;
        }
        return;
    }

    handle.priceImage.Visible = false;
    handle.priceViewport.Visible = false;
    handle.priceText.Text = "MAXED";
    tweenPriceColor(handle, Color3.fromRGB(199, 199, 199), false);
    handle.currentPriceItemId = undefined;
}

function buildPriceOptions(item: Item, price: CurrencyBundle | undefined): PriceOptionSequence {
    const options = new Array<CurrencyOption | ItemOption>();

    if (price) {
        for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
            const amount = price.get(currency);
            if (amount === undefined) continue;
            options.push({ kind: "currency", currency, amount });
        }
    }

    const requiredItems = item.requiredItems;
    if (requiredItems.size() > 0) {
        for (const candidate of Items.sortedItems) {
            const requiredAmount = requiredItems.get(candidate.id);
            if (requiredAmount === undefined) continue;
            options.push({ kind: "item", item: candidate, amount: requiredAmount });
        }
    }

    return options;
}

function startPriceRotation(handle: ShopSlotHandle, options: PriceOptionSequence) {
    const token = ++handle.rotationToken;
    let index = 0;
    const rotate = () => {
        if (handle.destroyed || handle.rotationToken !== token || !handle.root.Visible) {
            return;
        }
        index = (index + 1) % options.size();
        const option = options[index];
        applyPriceOption(handle, option);
        task.delay(2, rotate);
    };
    task.delay(2, rotate);
}

export interface CreateShopSlotOptions {
    parent: GuiObject;
    layoutOrder?: number;
    visible?: boolean;
    viewportsEnabled?: boolean;
    onActivated: (item: Item) => void;
}

export interface UpdateShopSlotOptions {
    parent?: GuiObject;
    layoutOrder?: number;
    baseVisible?: boolean;
    hideMaxedItems?: boolean;
    ownedAmount: number;
    onActivated?: (item: Item) => void;
}

export type ShopSlotHandle = {
    item: Item;
    root: Frame;
    button: TextButton;
    priceFrame: Frame;
    priceOptionFrame: Frame;
    priceImage: ImageLabel;
    priceViewport: ViewportFrame;
    priceText: TextLabel;
    stroke: UIStroke;
    connections: RBXScriptConnection[];
    viewportLoaded: boolean;
    itemImage?: ImageLabel;
    itemViewport?: ViewportFrame;
    currentTween?: Tween;
    rotationToken: number;
    onActivated?: (item: Item) => void;
    destroyed?: boolean;
    currentPriceItemId?: string;
    destroy(): void;
};

export function createShopSlot(item: Item, options: CreateShopSlotOptions): ShopSlotHandle {
    const { parent, layoutOrder = item.layoutOrder, visible = false, onActivated, viewportsEnabled = true } = options;

    const baseColor = item.difficulty?.color ?? Color3.fromRGB(52, 155, 255);

    const root = new Instance("Frame");
    root.Name = `ShopSlot_${item.id}`;
    root.BackgroundTransparency = 1;
    root.Size = new UDim2(1, 0, 1, 0);
    root.LayoutOrder = layoutOrder;
    root.Visible = visible;
    root.Parent = parent;

    const button = new Instance("TextButton");
    button.Name = "ItemButton";
    button.BackgroundColor3 = baseColor;
    button.BorderColor3 = Color3.fromRGB(0, 0, 0);
    button.BorderSizePixel = 5;
    button.Size = new UDim2(1, 0, 1, -40);
    button.Selectable = false;
    button.Text = "";
    button.AutoButtonColor = true;
    button.Parent = root;

    const padding = new Instance("UIPadding");
    padding.PaddingBottom = new UDim(0, 4);
    padding.PaddingTop = new UDim(0, 4);
    padding.PaddingLeft = new UDim(0, 4);
    padding.PaddingRight = new UDim(0, 4);
    padding.Parent = button;

    const stroke = createStroke(button, baseColor);
    applyStyling(button, 0.85);

    let itemImage: ImageLabel | undefined;
    let itemViewport: ViewportFrame | undefined;
    if (item.image !== undefined) {
        itemImage = new Instance("ImageLabel");
        itemImage.Name = "ItemImage";
        itemImage.AnchorPoint = new Vector2(0.5, 0.5);
        itemImage.BackgroundTransparency = 1;
        itemImage.Image = item.image;
        itemImage.Position = new UDim2(0.5, 0, 0.5, 0);
        itemImage.Size = new UDim2(0.7, 0, 0.7, 0);
        itemImage.SizeConstraint = Enum.SizeConstraint.RelativeYY;
        itemImage.Parent = button;
    } else {
        itemViewport = new Instance("ViewportFrame");
        itemViewport.Name = "ItemViewport";
        itemViewport.AnchorPoint = new Vector2(0.5, 0.5);
        itemViewport.BackgroundTransparency = 1;
        itemViewport.Position = new UDim2(0.5, 0, 0.5, 0);
        itemViewport.Size = new UDim2(1, 0, 1, 0);
        itemViewport.Parent = button;
        if (viewportsEnabled) ItemViewport.loadItemIntoViewport(itemViewport, item.id);
    }

    const priceFrame = new Instance("Frame");
    priceFrame.Name = "PriceFrame";
    priceFrame.AnchorPoint = new Vector2(0, 1);
    priceFrame.BackgroundColor3 = baseColor.Lerp(Color3.fromRGB(0, 0, 0), 0.7);
    priceFrame.BorderColor3 = Color3.fromRGB(0, 0, 0);
    priceFrame.BorderSizePixel = 5;
    priceFrame.Position = new UDim2(0, 0, 1, 0);
    priceFrame.Size = new UDim2(1, 0, 0, 30);
    priceFrame.Parent = root;

    const priceOptionFrame = new Instance("Frame");
    priceOptionFrame.Name = "PriceOption";
    priceOptionFrame.AutomaticSize = Enum.AutomaticSize.X;
    priceOptionFrame.BackgroundTransparency = 1;
    priceOptionFrame.Size = new UDim2(1, 0, 0, 28);
    priceOptionFrame.Parent = priceFrame;

    const priceCorner = new Instance("UICorner");
    priceCorner.CornerRadius = new UDim(0, 4);
    priceCorner.Parent = priceOptionFrame;

    const priceList = new Instance("UIListLayout");
    priceList.Padding = new UDim(0, 5);
    priceList.FillDirection = Enum.FillDirection.Horizontal;
    priceList.HorizontalAlignment = Enum.HorizontalAlignment.Center;
    priceList.Parent = priceOptionFrame;

    const priceImage = new Instance("ImageLabel");
    priceImage.Name = "PriceImage";
    priceImage.BackgroundTransparency = 1;
    priceImage.Size = new UDim2(1, 0, 1, 0);
    priceImage.SizeConstraint = Enum.SizeConstraint.RelativeYY;
    priceImage.Visible = false;
    priceImage.Parent = priceOptionFrame;

    const priceViewport = new Instance("ViewportFrame");
    priceViewport.Name = "PriceViewport";
    priceViewport.BackgroundTransparency = 1;
    priceViewport.Size = new UDim2(1, 0, 1, 0);
    priceViewport.SizeConstraint = Enum.SizeConstraint.RelativeYY;
    priceViewport.Visible = false;
    priceViewport.Parent = priceOptionFrame;

    const priceText = new Instance("TextLabel");
    priceText.Name = "PriceText";
    priceText.AutomaticSize = Enum.AutomaticSize.X;
    priceText.BackgroundTransparency = 1;
    priceText.FontFace = RobotoSlabHeavy;
    priceText.Size = new UDim2(0, 0, 1, 0);
    priceText.Text = "";
    priceText.TextScaled = true;
    priceText.Parent = priceOptionFrame;

    const priceStroke = new Instance("UIStroke");
    priceStroke.Color = Color3.fromRGB(0, 0, 0);
    priceStroke.Thickness = 2;
    priceStroke.Parent = priceText;

    applyStyling(priceFrame, 0.9);

    const connections = new Array<RBXScriptConnection>();

    const handle: ShopSlotHandle = {
        item,
        root,
        button,
        priceFrame,
        priceOptionFrame,
        priceImage,
        priceViewport,
        priceText,
        stroke,
        connections,
        itemImage,
        viewportLoaded: true,
        itemViewport,
        rotationToken: 0,
        onActivated,
        destroy() {
            if (this.destroyed) return;
            this.destroyed = true;
            for (const connection of this.connections) {
                connection.Disconnect();
            }
            if (this.currentTween) {
                this.currentTween.Cancel();
                this.currentTween = undefined;
            }
            this.root.Destroy();
        },
    };

    connections.push(
        button.Activated.Connect(() => {
            handle.onActivated?.(item);
        }),
    );

    return handle;
}

export function updateShopSlot(handle: ShopSlotHandle, options: UpdateShopSlotOptions) {
    if (handle.destroyed) return;

    const { parent, layoutOrder, baseVisible = false, hideMaxedItems = false, ownedAmount, onActivated } = options;

    if (parent && handle.root.Parent !== parent) {
        handle.root.Parent = parent;
    }

    if (layoutOrder !== undefined) {
        handle.root.LayoutOrder = layoutOrder;
    }

    if (onActivated) {
        handle.onActivated = onActivated;
    }

    const itemColor = handle.item.difficulty?.color ?? Color3.fromRGB(52, 155, 255);
    handle.button.BackgroundColor3 = itemColor;
    handle.stroke.Color = itemColor;
    handle.priceFrame.BackgroundColor3 = itemColor.Lerp(Color3.fromRGB(0, 0, 0), 0.7);

    if (handle.itemViewport && !handle.viewportLoaded) {
        handle.viewportLoaded = true;
        ItemViewport.loadItemIntoViewport(handle.itemViewport, handle.item.id);
    } else if (handle.itemImage) {
        handle.itemImage.Image = handle.item.image ?? "";
    }

    const price = handle.item.getPrice(ownedAmount + 1);
    const optionsList = buildPriceOptions(handle.item, price);

    const shouldHide = hideMaxedItems && price === undefined;
    const finalVisible = baseVisible && !shouldHide;

    if (!finalVisible) {
        if (handle.root.Visible !== false) {
            handle.root.Visible = false;
        }
        handle.rotationToken++;
    } else {
        if (handle.root.Visible !== true) {
            handle.root.Visible = true;
        }
    }

    if (optionsList.size() === 0) {
        applyPriceOption(handle, { kind: "maxed" });
        handle.rotationToken++;
        return;
    }

    const firstOption = optionsList[0];
    applyPriceOption(handle, firstOption);

    if (optionsList.size() > 1 && finalVisible) {
        startPriceRotation(handle, optionsList);
    } else {
        handle.rotationToken++;
    }
}
