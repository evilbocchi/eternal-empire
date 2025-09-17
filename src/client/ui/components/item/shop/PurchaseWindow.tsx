import { OnoeNum } from "@antivivi/serikanum";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import StringBuilder from "@rbxts/stringbuilder";
import displayBalanceCurrency from "client/ui/components/balance/displayBalanceCurrency";
import { useHotkey } from "client/ui/components/hotkeys/HotkeyManager";
import useHotkeyWithTooltip from "client/ui/components/hotkeys/useHotkeyWithTooltip";
import InventoryItemSlot from "client/ui/components/item/inventory/InventoryItemSlot";
import { ItemViewportManagement } from "client/ui/components/item/ItemViewport";
import ItemWindow from "client/ui/components/item/shop/ItemWindow";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import useSingleDocumentWindow from "client/ui/components/sidebar/useSingleDocumentWindow";
import getDifficultyDisplayColors from "client/ui/components/tooltip/getDifficultyDisplayColors";
import { METADATA_PER_ITEM, TooltipManager } from "client/ui/components/tooltip/TooltipWindow";
import { RobotoMono, RobotoSlab, RobotoSlabHeavy, RobotoSlabMedium } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Individual price option component for purchase window
 */
const PriceOption = forwardRef<
    Frame,
    {
        /** Currency amount and type */
        currency?: Currency;
        /** Item amount and type */
        item?: Item;
        /** Amount to display */
        amount: OnoeNum | number;
        /** Whether the price is affordable */
        affordable: boolean;
        /** Shared viewport management instance */
        viewportManagement?: ItemViewportManagement;
    }
>(({ currency, item, amount, affordable, viewportManagement }, ref) => {
    const viewportRef = useRef<ViewportFrame>();
    const textColor = affordable ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 80, 80);

    useEffect(() => {
        if (!item || !viewportRef.current) return;
        viewportManagement?.loadItemIntoViewport(viewportRef.current!, item.id);
    }, [viewportManagement, item?.id]);

    return (
        <frame
            ref={ref}
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundColor3={new Color3()}
            BackgroundTransparency={0.8}
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
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}

            {item && (
                <viewportframe
                    ref={viewportRef}
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}

            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(0, 0, 1, 0)}
                Text={currency ? displayBalanceCurrency(currency, amount as OnoeNum) : `${amount} ${item?.name}`}
                TextColor3={textColor}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
            </textlabel>
        </frame>
    );
});

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
    const [unaffordableLabel, setUnaffordableLabel] = useState("UNAFFORDABLE");
    const [affordablePerCurrency, setAffordablePerCurrency] = useState(new Map<Currency, boolean>());
    const [affordablePerItem, setAffordablePerItem] = useState(new Map<Item, boolean>());
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });
    const metadata = METADATA_PER_ITEM.get(item);

    useEffect(() => {
        let active = true;
        const updateUnaffordableLabel = () => {
            if (!active) return;
            const options = ["UNAFFORDABLE", "YOU ARE BROKE", "GET MORE STUFF", "WORK HARDER", "NOPE", "YOU WISH"];
            setUnaffordableLabel(options[math.floor(math.random(0, options.size() - 1))]);
            task.delay(5, updateUnaffordableLabel);
        };
        updateUnaffordableLabel();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const boughtConnection = Packets.bought.observe((boughtPerItem) => {
            const bought = boughtPerItem.get(item.id) ?? 0;
            const price = item.getPrice(bought + 1) ?? new CurrencyBundle();
            setBoughtData({ bought, price });
        });
        return () => boughtConnection.disconnect();
    }, [item]);

    useEffect(() => {
        const balanceConnection = Packets.balance.observe((balance) => {
            if (!price) return;

            const affordablePerCurrency = new Map<Currency, boolean>();
            for (const [currency, amount] of price.amountPerCurrency) {
                const inBalance = balance.get(currency) ?? new OnoeNum(0);
                affordablePerCurrency.set(currency, amount.lessEquals(inBalance));
            }
            setAffordablePerCurrency(affordablePerCurrency);
        });

        const inventoryConnection = Packets.inventory.observe((inventory) => {
            if (!price) return;

            const affordablePerItem = new Map<Item, boolean>();
            for (const [requiredItem, amount] of item.requiredItems) {
                const inInventory = inventory.get(requiredItem.id) ?? 0;
                affordablePerItem.set(requiredItem, inInventory >= amount);
            }
            setAffordablePerItem(affordablePerItem);
        });

        return () => {
            balanceConnection.disconnect();
            inventoryConnection.disconnect();
        };
    }, [item, price]);

    const purchase = () => {
        if (!visible) return false;

        if (Packets.buyItem.toServer(item.id)) {
            playSound("ItemPurchase.mp3");
        } else {
            playSound("Error.mp3");
        }
        return true;
    };
    useHotkey({
        action: purchase,
        label: "Purchase",
    });

    const description = metadata?.formatItemDescription(undefined, false, Color3.fromRGB(255, 255, 255), 20);

    const { background: backgroundColor, text: textColor } = useMemo(() => {
        return getDifficultyDisplayColors(item.difficulty);
    }, [item]);

    const priceOptionRefs = useRef<Map<string, Frame>>(new Map());

    // Clear refs when item changes to prevent stale references
    useEffect(() => {
        priceOptionRefs.current.clear();
    }, [item.id]);

    const priceOptions = new Array<JSX.Element>();
    for (const [currency, amount] of price.amountPerCurrency) {
        priceOptions.push(
            <PriceOption
                ref={(instance) => {
                    if (instance) {
                        priceOptionRefs.current.set(currency, instance);
                    } else {
                        priceOptionRefs.current.delete(currency);
                    }
                }}
                currency={currency}
                amount={amount}
                affordable={affordablePerCurrency.get(currency) ?? false}
            />,
        );
    }
    for (const [requiredItem, amount] of item.requiredItems) {
        priceOptions.push(
            <PriceOption
                ref={(instance) => {
                    if (instance) {
                        priceOptionRefs.current.set(requiredItem.id, instance);
                    } else {
                        priceOptionRefs.current.delete(requiredItem.id);
                    }
                }}
                item={requiredItem}
                amount={amount}
                affordable={affordablePerItem.get(requiredItem) ?? false}
                viewportManagement={viewportManagement}
            />,
        );
    }

    const containerPadding = 5;
    useEffect(() => {
        const button = purchaseButtonRef.current;
        if (!button) return;

        // Manually position price options to wrap within the purchase button
        const wrapPriceOptions = () => {
            const containerX = button.AbsoluteSize.X;
            // Account for the button's left and right padding
            const availableWidth = containerX - containerPadding * 2;
            const priceOptionsPerKey = priceOptionRefs.current;
            const priceOptions = new Array<Frame>();

            // Only get instances that actually exist in the current refs
            for (const [currency, amount] of price.amountPerCurrency) {
                const instance = priceOptionsPerKey.get(currency);
                if (instance) {
                    priceOptions.push(instance);
                }
            }
            for (const [requiredItem] of item.requiredItems) {
                const instance = priceOptionsPerKey.get(requiredItem.id);
                if (instance) {
                    priceOptions.push(instance);
                }
            }

            // Early return if no price options are available yet
            if (priceOptions.size() === 0) return;

            // First pass: organize options into rows
            const rows: Array<Array<{ instance: Frame; originalWidth: number; height: number }>> = [];
            let currentRow: Array<{ instance: Frame; originalWidth: number; height: number }> = [];
            let currentRowWidth = 0;

            for (const instance of priceOptions) {
                const size = instance.AbsoluteSize;
                const sizeX = size.X;
                const sizeY = size.Y;

                // Skip instances that haven't been sized yet
                if (sizeX === 0 || sizeY === 0) continue;

                // Check if this option fits in the current row
                const neededWidth = currentRowWidth + sizeX + (currentRow.size() > 0 ? containerPadding : 0);
                if (neededWidth > availableWidth && currentRow.size() > 0) {
                    // Start a new row
                    rows.push(currentRow);
                    currentRow = [{ instance, originalWidth: sizeX, height: sizeY }];
                    currentRowWidth = sizeX;
                } else {
                    // Add to current row
                    currentRow.push({ instance, originalWidth: sizeX, height: sizeY });
                    currentRowWidth = neededWidth;
                }
            }
            if (currentRow.size() > 0) {
                rows.push(currentRow);
            }

            // Second pass: position options with distributed widths
            let currentY = 0;
            for (const row of rows) {
                if (row.size() === 0) continue;

                // Calculate total original width used by this row
                const totalOriginalWidth = row.reduce((sum, item) => sum + item.originalWidth, 0);
                const totalPadding = (row.size() - 1) * containerPadding;
                const usedWidth = totalOriginalWidth + totalPadding;
                const excessWidth = availableWidth - usedWidth;
                const widthPerOption = excessWidth / row.size();

                // Position and resize options in this row
                let currentX = 0;
                for (const { instance, originalWidth, height } of row) {
                    const newWidth = originalWidth + widthPerOption;
                    instance.Position = new UDim2(0, currentX, 0, currentY);
                    instance.Size = new UDim2(0, newWidth, 0, height);
                    currentX += newWidth + containerPadding;
                }

                currentY += row[0].height + containerPadding;
            }
        };

        const connection = button.GetPropertyChangedSignal("AbsoluteSize").Connect(wrapPriceOptions);

        // Delay initial layout to ensure components are rendered
        const delayedWrap = () => {
            task.wait(); // Wait one frame
            wrapPriceOptions();
        };
        delayedWrap();

        return () => {
            connection.Disconnect();
        };
    }, [item.id, price, affordablePerCurrency, affordablePerItem]); // Changed dependencies

    const totalAffordable = useMemo(() => {
        let totalAffordable = true;
        for (const [, affordable] of affordablePerCurrency) {
            if (!affordable) {
                totalAffordable = false;
                break;
            }
        }
        for (const [, affordable] of affordablePerItem) {
            if (!affordable) {
                totalAffordable = false;
                break;
            }
        }
        return totalAffordable;
    }, [affordablePerCurrency, affordablePerItem]);

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
            <frame BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(0.9, 0, 0.075, 30)}>
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
                    tooltipEnabled={false}
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
                {!price.amountPerCurrency.isEmpty() && (
                    <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
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
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundColor3={Color3.fromRGB(85, 255, 127)}
                            BackgroundTransparency={totalAffordable ? 0 : 0.5}
                            BorderColor3={Color3.fromRGB(0, 28, 5)}
                            BorderSizePixel={3}
                            FontFace={RobotoSlabHeavy}
                            Selectable={false}
                            Text={totalAffordable ? "PURCHASE" : unaffordableLabel}
                            TextColor3={new Color3(0, 0, 0)}
                            TextSize={24}
                            TextTransparency={0.8}
                            TextXAlignment={Enum.TextXAlignment.Right}
                            TextYAlignment={Enum.TextYAlignment.Bottom}
                            Size={new UDim2(0.8, 0, 0, 0)}
                            Event={{
                                MouseMoved: () => {
                                    if (totalAffordable) return;
                                    const balance = Packets.balance.get();
                                    const inventory = Packets.inventory.get();
                                    const builder = new StringBuilder("Missing requirements:");
                                    for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
                                        if (affordablePerCurrency.get(currency) ?? true) continue;
                                        builder
                                            .append("<font size='16' color='#")
                                            .append(
                                                CURRENCY_DETAILS[currency].color.Lerp(new Color3(1, 1, 1), 0.7).ToHex(),
                                            )
                                            .append("'>\n- ")
                                            .append(new OnoeNum(balance.get(currency) ?? 0).toString())
                                            .append("/")
                                            .append(price.get(currency)!.toString())
                                            .append(" ")
                                            .append(currency)
                                            .append("</font>");
                                    }
                                    for (const requiredItem of Items.sortedItems) {
                                        if (affordablePerItem.get(requiredItem) ?? true) continue;
                                        const color = requiredItem.difficulty.color ?? Color3.fromRGB(255, 255, 255);
                                        builder
                                            .append("<font size='16' color='#")
                                            .append(color.Lerp(new Color3(1, 1, 1), 0.7).ToHex())
                                            .append("'>\n- ")
                                            .append(inventory.get(requiredItem.id) ?? 0)
                                            .append("/")
                                            .append(item.requiredItems.get(requiredItem))
                                            .append(" ")
                                            .append(requiredItem.name)
                                            .append("</font>");
                                    }
                                    TooltipManager.showTooltip({ message: builder.toString() });
                                },
                                MouseLeave: () => {
                                    TooltipManager.hideTooltip();
                                },
                                Activated: purchase,
                            }}
                        >
                            {priceOptions}

                            <uipadding
                                PaddingBottom={new UDim(0, containerPadding)}
                                PaddingTop={new UDim(0, containerPadding)}
                                PaddingLeft={new UDim(0, containerPadding)}
                                PaddingRight={new UDim(0, containerPadding)}
                            />
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
                        </textbutton>
                    </frame>
                )}
            </scrollingframe>
        </ItemWindow>
    );
}
