import { OnoeNum } from "@antivivi/serikanum";
import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import displayBalanceCurrency from "client/ui/components/balance/displayBalanceCurrency";
import { ItemViewportManagement } from "client/ui/components/item/ItemViewport";
import { useItemViewport } from "client/ui/components/item/useCIViewportManagement";
import { RobotoSlabHeavy } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

const TweenService = game.GetService("TweenService");

function ShopPriceOption({
    currency,
    item,
    amount,
    viewportManagement,
}: {
    currency?: Currency;
    item?: Item;
    amount: OnoeNum | number;
    viewportManagement?: ItemViewportManagement;
}) {
    // Always call hooks unconditionally
    const viewportRef = useRef<ViewportFrame>();
    const textLabelRef = useRef<TextLabel>();
    const currentTweenRef = useRef<Tween>();

    // Only pass itemId if item is defined, otherwise pass empty string
    useItemViewport(viewportRef, item?.id ?? "", viewportManagement);

    const image = currency !== undefined ? CURRENCY_DETAILS[currency].image : item?.image;
    let targetColor = Color3.fromRGB(255, 255, 255);
    if (currency !== undefined) {
        targetColor = CURRENCY_DETAILS[currency].color;
    } else if (item !== undefined) {
        targetColor = item.difficulty?.color ?? Color3.fromRGB(255, 255, 255);
    }
    targetColor = new Color3(
        math.clamp(targetColor.R, 0.1, 0.9),
        math.clamp(targetColor.G, 0.1, 0.9),
        math.clamp(targetColor.B, 0.1, 0.9),
    );

    // Tween color when currency or item changes
    useEffect(() => {
        if (!textLabelRef.current) return;

        // Cancel any existing tween
        if (currentTweenRef.current) {
            currentTweenRef.current.Cancel();
        }

        const tweenInfo = new TweenInfo(0.3, Enum.EasingStyle.Quart, Enum.EasingDirection.Out);
        const tween = TweenService.Create(textLabelRef.current, tweenInfo, {
            TextColor3: targetColor,
        });

        currentTweenRef.current = tween;
        tween.Play();

        return () => {
            if (currentTweenRef.current) {
                currentTweenRef.current.Cancel();
                currentTweenRef.current = undefined;
            }
        };
    }, [currency, item]);

    return (
        <frame AutomaticSize={Enum.AutomaticSize.X} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 28)}>
            <uicorner CornerRadius={new UDim(0, 4)} />
            <uilistlayout
                Padding={new UDim(0, 5)}
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
            />
            {image !== undefined ? (
                <imagelabel
                    BackgroundTransparency={1}
                    Image={image}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            ) : (
                <viewportframe
                    ref={viewportRef}
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}
            {(currency !== undefined || item !== undefined) && (
                <textlabel
                    ref={textLabelRef}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Size={new UDim2(0, 0, 1, 0)}
                    Text={currency !== undefined ? displayBalanceCurrency(currency, amount) : tostring(amount)}
                    TextScaled={true}
                >
                    <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
                </textlabel>
            )}
        </frame>
    );
}

export function ShopItemSlotStyling({ gridTransparency = 0.85 }: { gridTransparency?: number }) {
    return (
        <Fragment>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76)),
                    ])
                }
                Rotation={90}
            />
            <imagelabel
                BackgroundTransparency={1}
                Image={getAsset("assets/Vignette.png")}
                ImageTransparency={0.2}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-4}
            />
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={getAsset("assets/Grid.png")}
                ImageColor3={Color3.fromRGB(126, 126, 126)}
                ImageTransparency={gridTransparency}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0, 100, 0, 100)}
                ZIndex={-5}
            />
        </Fragment>
    );
}

/**
 * Individual shop item slot component
 */
export default function ShopItemSlot({
    item,
    ownedAmount,
    onClick,
    layoutOrder = 0,
    visible,
    viewportManagement,
}: {
    /** The item to display in the slot */
    item: Item;
    /** Amount of the item the player currently owns */
    ownedAmount: number;
    /** Callback when the slot is clicked */
    onClick: () => void;
    /** Layout order for sorting */
    layoutOrder?: number;
    /** Whether the slot is visible */
    visible: boolean;
    /** Shared viewport management instance */
    viewportManagement?: ItemViewportManagement;
}) {
    const viewportRef = useRef<ViewportFrame>();
    const difficulty = item.difficulty;
    const color = difficulty?.color ?? Color3.fromRGB(52, 155, 255);
    useItemViewport(viewportRef, item.id, viewportManagement);

    const price = item.getPrice(ownedAmount + 1);
    const requiredItems = item.requiredItems;

    const [viewing, setViewing] = useState<Currency | Item>();
    useEffect(() => {
        if (price === undefined || !visible) return;

        const options = new Array<Currency | Item>();
        for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
            const amount = price.get(currency);
            if (amount === undefined) continue;
            options.push(currency);
        }
        for (const item of Items.sortedItems) {
            if (!requiredItems.has(item)) continue;
            options.push(item);
        }
        let active = true;
        let i = 0;
        const max = options.size();
        const scrollToNext = () => {
            if (!active) return;
            if (++i >= max) i = 0;
            setViewing(options[i]);
            task.delay(2, scrollToNext);
        };
        if (max > 1) {
            scrollToNext();
        } else {
            setViewing(options[0]);
        }
        return () => {
            active = false;
        };
    }, [price, requiredItems, visible]);

    const isCurrency = typeIs(viewing, "string");
    const currency = isCurrency ? (viewing as Currency) : undefined;
    const reqItem = !isCurrency ? (viewing as Item) : undefined;
    const amount = currency ? price?.get(currency) : reqItem !== undefined ? requiredItems.get(reqItem) : 0;

    return (
        <frame BackgroundTransparency={1} LayoutOrder={layoutOrder} Visible={visible}>
            <textbutton
                BackgroundColor3={color}
                BorderColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={5}
                Size={new UDim2(1, 0, 1, -40)}
                Selectable={false}
                Text=""
                Event={{
                    Activated: onClick,
                }}
            >
                {/* Viewport frame for 3D item display */}
                <viewportframe
                    ref={viewportRef}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, 0, 1, 0)}
                />
                <uipadding
                    PaddingBottom={new UDim(0, 4)}
                    PaddingTop={new UDim(0, 4)}
                    PaddingLeft={new UDim(0, 4)}
                    PaddingRight={new UDim(0, 4)}
                />

                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={color} Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                                new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                            ])
                        }
                        Rotation={35}
                    />
                </uistroke>
                <ShopItemSlotStyling />
            </textbutton>
            <frame
                AnchorPoint={new Vector2(0, 1)}
                BackgroundColor3={color.Lerp(Color3.fromRGB(0, 0, 0), 0.7)}
                BorderColor3={new Color3(0, 0, 0)}
                BorderSizePixel={5}
                Position={new UDim2(0, 0, 1, 0)}
                Size={new UDim2(1, 0, 0, 30)}
            >
                {amount !== undefined && (
                    <ShopPriceOption
                        currency={currency}
                        item={reqItem}
                        amount={amount}
                        viewportManagement={viewportManagement}
                    />
                )}
                <ShopItemSlotStyling gridTransparency={0.9} />
            </frame>
        </frame>
    );
}
