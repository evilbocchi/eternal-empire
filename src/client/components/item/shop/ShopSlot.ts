/**
 * @fileoverview Imperative helpers for creating and updating shop item slots.
 */

import { OnoeNum } from "@rbxts/serikanum";
import { TweenService } from "@rbxts/services";
import displayBalanceCurrency from "client/components/balance/displayBalanceCurrency";
import ItemViewport from "shared/item/ItemViewport";
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
    layoutOrder?: number;
    baseVisible?: boolean;
    hideMaxedItems?: boolean;
    ownedAmount: number;
    onActivated?: (item: Item) => void;
    empireLevel?: number;
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
    lockOverlay: Frame;
    lockIcon: ImageLabel;
    lockText: TextLabel;
    currentTween?: Tween;
    rotationToken: number;
    onActivated?: (item: Item) => void;
    destroyed?: boolean;
    currentPriceItemId?: string;
    isLocked: boolean;
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

    const lockOverlay = new Instance("Frame");
    lockOverlay.Name = "LockOverlay";
    lockOverlay.Active = false;
    lockOverlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
    lockOverlay.BackgroundTransparency = 0.35;
    lockOverlay.Visible = false;
    lockOverlay.Size = new UDim2(1, 0, 1, 0);
    lockOverlay.ZIndex = 10;
    lockOverlay.Parent = button;

    getAsset("assets/Lock.png");

    const lockCorner = new Instance("UICorner");
    lockCorner.Parent = lockOverlay;

    const lockIcon = new Instance("ImageLabel");
    lockIcon.Name = "LockIcon";
    lockIcon.AnchorPoint = new Vector2(0.5, 0.5);
    lockIcon.BackgroundTransparency = 1;
    lockIcon.Image = getAsset("assets/Lock.png");
    lockIcon.Position = new UDim2(0.5, 0, 0.45, 0);
    lockIcon.Size = new UDim2(0.35, 0, 0.35, 0);
    lockIcon.SizeConstraint = Enum.SizeConstraint.RelativeYY;
    lockIcon.Visible = false;
    lockIcon.ZIndex = 11;
    lockIcon.Parent = lockOverlay;

    const lockText = new Instance("TextLabel");
    lockText.Name = "LockText";
    lockText.AnchorPoint = new Vector2(0.5, 0.5);
    lockText.BackgroundTransparency = 1;
    lockText.FontFace = RobotoSlabHeavy;
    lockText.Position = new UDim2(0.5, 0, 0.75, 0);
    lockText.Size = new UDim2(0.7, 0, 0.25, 0);
    lockText.Text = "";
    lockText.TextColor3 = Color3.fromRGB(255, 255, 255);
    lockText.TextScaled = true;
    lockText.TextStrokeTransparency = 0.1;
    lockText.TextStrokeColor3 = Color3.fromRGB(0, 0, 0);
    lockText.TextWrapped = true;
    lockText.TextXAlignment = Enum.TextXAlignment.Center;
    lockText.TextYAlignment = Enum.TextYAlignment.Center;
    lockText.LineHeight = 0.9;
    lockText.ZIndex = 11;
    lockText.Parent = lockOverlay;

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
        lockOverlay,
        lockIcon,
        lockText,
        rotationToken: 0,
        onActivated,
        isLocked: false,
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
            if (handle.isLocked) return;
            handle.onActivated?.(item);
        }),
    );

    return handle;
}

export function updateShopSlot(handle: ShopSlotHandle, options: UpdateShopSlotOptions) {
    if (handle.destroyed) return;

    const { layoutOrder, baseVisible = false, hideMaxedItems = false, ownedAmount, onActivated, empireLevel } = options;

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

    const levelRequirement = handle.item.levelReq;
    const currentLevel = empireLevel ?? 0;
    const isLocked = levelRequirement !== undefined && currentLevel < levelRequirement;
    handle.isLocked = isLocked;
    handle.button.AutoButtonColor = !isLocked;
    handle.button.Active = !isLocked;
    if (handle.itemImage) {
        handle.itemImage.ImageTransparency = isLocked ? 0.4 : 0;
    }
    if (handle.itemViewport) {
        handle.itemViewport.ImageTransparency = isLocked ? 0.4 : 0;
    }

    const price = handle.item.getPrice(ownedAmount + 1);
    const isMaxed = price === undefined;
    const optionsList = isMaxed ? new Array<CurrencyOption | ItemOption>() : buildPriceOptions(handle.item, price);

    const shouldHide = hideMaxedItems && isMaxed;
    const finalVisible = baseVisible && !shouldHide;

    if (levelRequirement !== undefined && isLocked) {
        handle.lockText.Text = `Lv. ${levelRequirement}`;
    } else {
        handle.lockText.Text = "";
    }

    const showLock = finalVisible && isLocked;
    handle.lockOverlay.Visible = showLock;
    handle.lockIcon.Visible = showLock;
    handle.lockText.Visible = showLock && handle.lockText.Text !== "";

    if (!finalVisible) {
        if (handle.root.Visible !== false) {
            handle.root.Visible = false;
        }
        handle.rotationToken++;
        handle.lockIcon.Visible = false;
        handle.lockText.Visible = false;
    } else {
        if (handle.root.Visible !== true) {
            handle.root.Visible = true;
        }
    }

    if (isMaxed || optionsList.size() === 0) {
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
