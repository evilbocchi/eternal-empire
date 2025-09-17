import Difficulty from "@antivivi/jjt-difficulties";
import React, { useMemo } from "@rbxts/react";
import InventoryItemSlot from "client/ui/components/item/inventory/InventoryItemSlot";
import ItemWindow from "client/ui/components/item/shop/ItemWindow";
import useSingleDocumentWindow from "client/ui/components/sidebar/useSingleDocumentWindow";
import getDifficultyDisplayColors from "client/ui/components/tooltip/getDifficultyDisplayColors";
import { RobotoSlabHeavy, RobotoSlabMedium } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";

interface PriceOptionProps {
    /** Currency amount and type */
    currency?: Currency;
    /** Item amount and type */
    item?: Item;
    /** Amount to display */
    amount: number | string;
    /** Whether the price is affordable */
    affordable: boolean;
    /** Layout order for sorting */
    layoutOrder?: number;
}

/**
 * Individual price option component for purchase window
 */
function PriceOption({ currency, item, amount, affordable, layoutOrder = 0 }: PriceOptionProps) {
    const textColor = affordable ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 80, 80);

    return (
        <frame LayoutOrder={layoutOrder} Size={new UDim2(1, 0, 0, 30)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {currency && (
                <imagelabel
                    BackgroundTransparency={1}
                    Image={CURRENCY_DETAILS[currency].image}
                    LayoutOrder={1}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(0, 25, 0, 25)}
                />
            )}

            {item && <viewportframe BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(0, 25, 0, 25)} />}

            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Font={Enum.Font.RobotoMono}
                LayoutOrder={2}
                Size={new UDim2(0, 0, 1, 0)}
                Text={tostring(amount)}
                TextColor3={textColor}
                TextScaled={true}
                TextSize={18}
                TextWrapped={true}
            />
        </frame>
    );
}

interface DifficultyLabelProps {
    /** The item difficulty to display */
    difficulty?: Difficulty;
}

/**
 * Difficulty label component showing item difficulty
 */
function DifficultyLabel({ difficulty }: DifficultyLabelProps) {
    if (!difficulty) return <></>;

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 30)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            <imagelabel
                BackgroundTransparency={1}
                Image={difficulty.image ? `rbxassetid://${difficulty.image}` : ""}
                LayoutOrder={1}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0, 25, 0, 25)}
            />

            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Font={Enum.Font.SourceSansBold}
                LayoutOrder={2}
                Size={new UDim2(0, 0, 1, 0)}
                Text={difficulty.name}
                TextColor3={difficulty.color ?? Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={16}
                TextWrapped={true}
            />
        </frame>
    );
}

/**
 * Purchase window component for buying shop items
 */
export default function PurchaseWindow({
    item,
    description,
    creator,
    priceOptions,
    owned,
    canPurchase,
    affordable,
    onPurchase,
    strokeColor = Color3.fromRGB(255, 255, 255),
}: {
    /** The item to display for purchase */
    item: Item;
    /** The formatted description text */
    description: string;
    /** The creator text */
    creator?: string;
    /** Array of price options */
    priceOptions: Array<{
        currency?: Currency;
        item?: Item;
        amount: number | string;
        affordable: boolean;
    }>;
    /** Current owned amount */
    owned: number;
    /** Whether the purchase button should be visible */
    canPurchase: boolean;
    /** Whether all price options are affordable */
    affordable: boolean;
    /** Callback when purchase button is clicked */
    onPurchase: () => void;
    /** Stroke color for styling */
    strokeColor?: Color3;
}) {
    const { visible, closeWindow } = useSingleDocumentWindow("Purchase");

    const purchaseButtonColor = affordable ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(56, 176, 84);
    const purchaseButtonText = affordable ? "PURCHASE" : "UNAFFORDABLE";

    const { background: backgroundColor, text: textColor } = useMemo(() => {
        return getDifficultyDisplayColors(item.difficulty);
    }, [item]);

    return (
        <ItemWindow
            visible={visible}
            icon={getAsset("assets/Purchase.png")}
            title="Purchase"
            backgroundColor={backgroundColor}
            strokeColor={
                new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(138, 199, 255)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(122, 255, 214)),
                ])
            }
            onClose={closeWindow}
            priority={1}
        >
            {/* Main layout */}
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Item slot display */}
            <frame BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(1, 0, 0, 50)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 15)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Item slot */}
                <InventoryItemSlot
                    item={item}
                    amount={owned}
                    layoutOrder={-1}
                    visible={true}
                    onActivated={() => {}}
                    size={new UDim2(0, 50, 0, 50)}
                />

                <frame AutomaticSize={Enum.AutomaticSize.X} BackgroundTransparency={1} Size={new UDim2(0, 0, 1, 0)}>
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 110, 0, 15)}
                        Size={new UDim2(0, 0, 0.57, 0)}
                        Text={item.name}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                    <frame
                        AnchorPoint={new Vector2(0, 1)}
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        LayoutOrder={1}
                        Position={new UDim2(0, 110, 1, -15)}
                        Size={new UDim2(0, 0, 0.43, 0)}
                    >
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            Padding={new UDim(0, 10)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                        <imagelabel
                            AnchorPoint={new Vector2(1, 0.5)}
                            BackgroundTransparency={1}
                            Image={item.difficulty?.image ? `rbxassetid://${item.difficulty?.image}` : ""}
                            LayoutOrder={-1}
                            Position={new UDim2(1, -4, 0.5, 0)}
                            Size={new UDim2(0, 0, 1, 0)}
                        >
                            <uiaspectratioconstraint
                                AspectType={Enum.AspectType.ScaleWithParentSize}
                                DominantAxis={Enum.DominantAxis.Height}
                            />
                            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                        </imagelabel>
                        <textlabel
                            AutomaticSize={Enum.AutomaticSize.X}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabMedium}
                            Position={new UDim2(0, 110, 0, 40)}
                            Size={new UDim2(0, 0, 1, 0)}
                            Text={item.difficulty?.name ?? ""}
                            TextColor3={textColor}
                            TextScaled={true}
                            TextSize={14}
                            TextWrapped={true}
                        >
                            <uistroke Thickness={2} />
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                        new ColorSequenceKeypoint(0.47800000000000004, Color3.fromRGB(225, 225, 225)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(148, 148, 148)),
                                    ])
                                }
                                Rotation={90}
                            />
                        </textlabel>
                    </frame>
                    <uilistlayout
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                </frame>
            </frame>

            {/* Description frame */}
            <scrollingframe
                Active={true}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                LayoutOrder={2}
                ScrollBarThickness={6}
                Selectable={false}
                Size={new UDim2(1, 0, 0, 200)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />

                {/* Description label */}
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    Font={Enum.Font.RobotoMono}
                    LayoutOrder={1}
                    RichText={true}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={description}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={false}
                    TextSize={16}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                />

                {/* Creator label */}
                {creator ? (
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        Font={Enum.Font.SourceSans}
                        LayoutOrder={2}
                        Size={new UDim2(1, 0, 0, 0)}
                        Text={`Creator: ${creator}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={false}
                        TextSize={14}
                        TextTransparency={0.8}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} Transparency={0.8} />
                    </textlabel>
                ) : undefined}

                {/* Purchase container */}
                {canPurchase && (
                    <frame BackgroundTransparency={1} LayoutOrder={3} Size={new UDim2(1, 0, 0, 100)}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 10)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                        />

                        {/* Price options */}
                        <frame BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(1, 0, 0, 40)}>
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                Padding={new UDim(0, 5)}
                                SortOrder={Enum.SortOrder.LayoutOrder}
                            />

                            {priceOptions.map((option, index) => (
                                <PriceOption
                                    key={index}
                                    currency={option.currency}
                                    item={option.item}
                                    amount={option.amount}
                                    affordable={option.affordable}
                                    layoutOrder={index}
                                />
                            ))}
                        </frame>

                        {/* Purchase button */}
                        <textbutton
                            BackgroundColor3={purchaseButtonColor}
                            BorderColor3={Color3.fromRGB(27, 42, 53)}
                            LayoutOrder={2}
                            Selectable={false}
                            Size={new UDim2(0.8, 0, 0, 50)}
                            Text=""
                            Event={{
                                Activated: onPurchase,
                            }}
                        >
                            <uistroke
                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                Color={purchaseButtonColor}
                                Thickness={3}
                            />

                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 255)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                    ])
                                }
                                Rotation={270}
                            />

                            <textlabel
                                BackgroundTransparency={1}
                                Font={Enum.Font.SourceSansBold}
                                Size={new UDim2(1, 0, 1, 0)}
                                Text={purchaseButtonText}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={true}
                                TextSize={18}
                                TextWrapped={true}
                            >
                                <uistroke Color={Color3.fromRGB(5, 16, 0)} Thickness={2} />
                            </textlabel>
                        </textbutton>
                    </frame>
                )}
            </scrollingframe>
        </ItemWindow>
    );
}
