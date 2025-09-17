import { OnoeNum } from "@antivivi/serikanum";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import displayBalanceCurrency from "client/ui/components/balance/displayBalanceCurrency";
import InventoryItemSlot from "client/ui/components/item/inventory/InventoryItemSlot";
import { ItemViewportManagement } from "client/ui/components/item/ItemViewport";
import ItemWindow from "client/ui/components/item/shop/ItemWindow";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import useSingleDocumentWindow from "client/ui/components/sidebar/useSingleDocumentWindow";
import getDifficultyDisplayColors from "client/ui/components/tooltip/getDifficultyDisplayColors";
import { METADATA_PER_ITEM } from "client/ui/components/tooltip/TooltipWindow";
import { RobotoMono, RobotoSlab, RobotoSlabHeavy, RobotoSlabMedium } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Packets from "shared/Packets";

/**
 * Individual price option component for purchase window
 */
function PriceOption({
    currency,
    item,
    amount,
    affordable,
    layoutOrder = 0,
    viewportManagement,
}: {
    /** Currency amount and type */
    currency?: Currency;
    /** Item amount and type */
    item?: Item;
    /** Amount to display */
    amount: OnoeNum | number;
    /** Whether the price is affordable */
    affordable: boolean;
    /** Layout order for sorting */
    layoutOrder?: number;
    /** Shared viewport management instance */
    viewportManagement?: ItemViewportManagement;
}) {
    const viewportRef = useRef<ViewportFrame>();
    const textColor = affordable ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 80, 80);

    useEffect(() => {
        if (!item || !viewportRef.current) return;
        viewportManagement?.loadItemIntoViewport(viewportRef.current!, item.id);
    }, [viewportManagement, item?.id]);

    return (
        <frame
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundColor3={new Color3()}
            BackgroundTransparency={0.8}
            LayoutOrder={layoutOrder}
            Size={new UDim2(0, 0, 0, 25)}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 4)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding
                PaddingBottom={new UDim(0, 1)}
                PaddingTop={new UDim(0, 1)}
                PaddingLeft={new UDim(0, 10)}
                PaddingRight={new UDim(0, 10)}
            />
            <uicorner CornerRadius={new UDim(0, 5)} />

            {currency && (
                <imagelabel
                    BackgroundTransparency={1}
                    Image={CURRENCY_DETAILS[currency].image}
                    LayoutOrder={1}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}

            {item && (
                <viewportframe
                    ref={viewportRef}
                    BackgroundTransparency={1}
                    LayoutOrder={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}

            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                LayoutOrder={2}
                Size={new UDim2(0, 0, 1, 0)}
                Text={currency ? displayBalanceCurrency(currency, amount as OnoeNum) : `${amount} ${item?.name}`}
                TextColor3={textColor}
                TextScaled={true}
                TextSize={18}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.7, Color3.fromRGB(225, 225, 225)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(112, 112, 112)),
                        ])
                    }
                    Rotation={90}
                />
            </textlabel>
        </frame>
    );
}

/**
 * Purchase window component for buying shop items
 */
export default function PurchaseWindow({
    item,
    viewportsEnabled,
}: {
    /** The item to display for purchase */
    item: Item;
    /** Whether 3D model viewports are enabled */
    viewportsEnabled?: boolean;
}) {
    const purchaseButtonRef = useRef<TextButton>();
    const { visible, closeWindow } = useSingleDocumentWindow("Purchase");
    const [{ bought, price }, setBoughtData] = useState({ bought: 0, price: new CurrencyBundle() });
    const [affordablePerCurrency, setAffordablePerCurrency] = useState(new Map<Currency, boolean>());
    const [affordablePerItem, setAffordablePerItem] = useState(new Map<Item, boolean>());
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });
    const metadata = METADATA_PER_ITEM.get(item);
    const canPurchase = price !== undefined;

    useEffect(() => {
        const boughtConnection = Packets.bought.observe((boughtPerItem) => {
            const bought = boughtPerItem.get(item.id) ?? 0;
            const price = item.getPrice(bought + 1) ?? new CurrencyBundle();
            setBoughtData({ bought, price });
        });
        return () => boughtConnection.disconnect();
    }, []);

    useEffect(() => {
        const balanceConnection = Packets.balance.observe((balance) => {
            if (!price) return;

            const affordablePerCurrency = new Map<Currency, boolean>();
            for (const [currency, amount] of price.amountPerCurrency) {
                const inBalance = balance.get(currency);
                affordablePerCurrency.set(currency, inBalance !== undefined && amount.lessEquals(inBalance));
            }
            setAffordablePerCurrency(affordablePerCurrency);
        });

        const inventoryConnection = Packets.inventory.observe((inventory) => {
            if (!price) return;

            const affordablePerItem = new Map<Item, boolean>();
            for (const [requiredItem, amount] of item.requiredItems) {
                const inInventory = inventory.get(requiredItem.id);
                affordablePerItem.set(requiredItem, inInventory !== undefined && inInventory >= amount);
            }
            setAffordablePerItem(affordablePerItem);
        });

        return () => {
            balanceConnection.disconnect();
            inventoryConnection.disconnect();
        };
    }, [item, bought]);

    const onPurchase = useCallback(() => {
        const success = Packets.buyItem.toServer(item.id);
    }, []);

    const description = metadata?.formatItemDescription(undefined, false, Color3.fromRGB(255, 255, 255), 20);

    const { background: backgroundColor, text: textColor } = useMemo(() => {
        return getDifficultyDisplayColors(item.difficulty);
    }, [item]);

    const priceOptions = new Array<JSX.Element>();
    for (const [currency, amount] of price.amountPerCurrency) {
        priceOptions.push(
            <PriceOption
                currency={currency}
                amount={amount}
                affordable={affordablePerCurrency.get(currency) ?? false}
                layoutOrder={CURRENCY_DETAILS[currency].layoutOrder}
            />,
        );
    }
    for (const [requiredItem, amount] of item.requiredItems) {
        priceOptions.push(
            <PriceOption
                item={requiredItem}
                amount={amount}
                affordable={affordablePerItem.get(requiredItem) ?? false}
                layoutOrder={100 + requiredItem.layoutOrder}
                viewportManagement={viewportManagement}
            />,
        );
    }

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
            <frame BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(1, 0, 0.075, 30)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                    Padding={new UDim(0, 15)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Item slot */}
                <InventoryItemSlot
                    item={item}
                    amount={bought}
                    layoutOrder={-1}
                    visible={true}
                    onActivated={() => {}}
                    size={new UDim2(0, 0, 1, 0)}
                    viewportManagement={viewportManagement}
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
                            BackgroundColor3={item.difficulty.color ?? Color3.fromRGB(255, 255, 255)}
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
                Size={new UDim2(1, 0, 0.925, -40)}
            >
                <uipadding PaddingBottom={new UDim(0, 10)} />
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
                    FontFace={RobotoSlab}
                    RichText={true}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={description}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={false}
                    TextSize={18}
                    TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                />

                {/* Creator label */}
                {item.creator ? (
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoMono}
                        Size={new UDim2(1, 0, 0, 0)}
                        Text={`Creator: ${item.creator}`}
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

                {/* Spacer */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
                    <uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
                </frame>

                {/* Purchase container */}
                {canPurchase && (
                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 50)}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 10)}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                        <uipadding PaddingBottom={new UDim(0, 5)} PaddingTop={new UDim(0, 5)} />

                        {/* Purchase button */}
                        <textbutton
                            ref={purchaseButtonRef}
                            BackgroundColor3={Color3.fromRGB(85, 255, 127)}
                            BorderColor3={Color3.fromRGB(0, 28, 5)}
                            BorderSizePixel={3}
                            Selectable={false}
                            Text=""
                            Size={new UDim2(0.8, 0, 0.8, 0)}
                            Event={{
                                Activated: onPurchase,
                            }}
                        >
                            {priceOptions}

                            <uistroke
                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                Color={Color3.fromRGB(156, 255, 156)}
                                Thickness={1}
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
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Horizontal}
                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                Padding={new UDim(0, 5)}
                                SortOrder={Enum.SortOrder.LayoutOrder}
                                VerticalAlignment={Enum.VerticalAlignment.Center}
                            />
                        </textbutton>
                    </frame>
                )}
            </scrollingframe>
        </ItemWindow>
    );
}
