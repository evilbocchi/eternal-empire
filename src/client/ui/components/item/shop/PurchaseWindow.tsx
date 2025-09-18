import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect, useMemo, useState } from "@rbxts/react";
import StringBuilder from "@rbxts/stringbuilder";
import { useHotkey } from "client/ui/components/hotkeys/HotkeyManager";
import InventoryItemSlot from "client/ui/components/item/inventory/InventoryItemSlot";
import ItemWindow from "client/ui/components/item/shop/ItemWindow";
import { WrappingPriceOptions } from "client/ui/components/item/shop/PriceOption";
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
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import Packets from "shared/Packets";

export class PurchaseManager {
    static readonly itemSelected = new Signal<Item>();

    static select(item: Item) {
        this.itemSelected.fire(item);
    }
}

/**
 * Purchase window component for buying shop items
 */
export default function PurchaseWindow({
    viewportsEnabled,
}: {
    /** Whether 3D model viewports are enabled */
    viewportsEnabled?: boolean;
}) {
    const { visible, closeWindow, openWindow } = useSingleDocumentWindow("Purchase");
    const [{ bought, price }, setBoughtData] = useState({ bought: 0, price: new CurrencyBundle() });
    const [unaffordableLabel, setUnaffordableLabel] = useState("UNAFFORDABLE");
    const [affordablePerCurrency, setAffordablePerCurrency] = useState(new Map<Currency, boolean>());
    const [affordablePerItem, setAffordablePerItem] = useState(new Map<Item, boolean>());
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });
    const [item, setItem] = useState<Item>(TheFirstDropper);
    const metadata = METADATA_PER_ITEM.get(item);

    useEffect(() => {
        const connection = PurchaseManager.itemSelected.connect((newItem) => {
            setItem(newItem);
            openWindow();
        });

        return () => {
            connection.disconnect();
        };
    }, []);

    // Hidden cycle for unaffordable label changes
    useEffect(() => {
        if (visible) return;

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
    }, [visible]);

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

    const containerPadding = 5;
    const requiredItems = item.requiredItems;

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
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    VerticalFlex={Enum.UIFlexAlignment.Fill}
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

                {/* Purchase container */}
                {!price.amountPerCurrency.isEmpty() ? (
                    <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
                        <textbutton
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
                            TextTransparency={0.9}
                            TextXAlignment={Enum.TextXAlignment.Right}
                            TextYAlignment={Enum.TextYAlignment.Bottom}
                            Size={new UDim2(0.8, 0, 0, 0)}
                            Event={{
                                MouseMoved: () => {
                                    if (totalAffordable) return;
                                    const balance = Packets.balance.get();
                                    const inventory = Packets.inventory.get();
                                    const builder = new StringBuilder("Missing:");
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
                                            .append(requiredItems.get(requiredItem))
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
                            {
                                <WrappingPriceOptions
                                    price={price}
                                    requiredItems={requiredItems}
                                    viewportManagement={viewportManagement}
                                    affordablePerCurrency={affordablePerCurrency}
                                    affordablePerItem={affordablePerItem}
                                />
                            }
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
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            VerticalAlignment={Enum.VerticalAlignment.Bottom}
                        />
                        <uipadding PaddingBottom={new UDim(0, 2)} />
                        <uiflexitem FlexMode={Enum.UIFlexMode.None} />
                    </frame>
                ) : (
                    <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 10)}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                        <uipadding PaddingBottom={new UDim(0, 5)} PaddingTop={new UDim(0, 5)} />

                        {/* Not purchasable disclaimer */}
                        <frame
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundColor3={Color3.fromRGB(255, 80, 80)}
                            BackgroundTransparency={0.2}
                            BorderColor3={Color3.fromRGB(180, 0, 0)}
                            BorderSizePixel={2}
                            Size={new UDim2(0.8, 0, 0, 0)}
                        >
                            <uipadding
                                PaddingBottom={new UDim(0, 10)}
                                PaddingTop={new UDim(0, 10)}
                                PaddingLeft={new UDim(0, 15)}
                                PaddingRight={new UDim(0, 15)}
                            />
                            <uistroke
                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                Color={Color3.fromRGB(255, 120, 120)}
                                Thickness={1}
                            />

                            <textlabel
                                AutomaticSize={Enum.AutomaticSize.Y}
                                BackgroundTransparency={1}
                                FontFace={RobotoSlabHeavy}
                                Size={new UDim2(1, 0, 0, 0)}
                                Text="NOT PURCHASABLE"
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={false}
                                TextSize={20}
                                TextWrapped={true}
                                TextXAlignment={Enum.TextXAlignment.Center}
                                TextYAlignment={Enum.TextYAlignment.Center}
                            >
                                <uistroke Color={Color3.fromRGB(150, 0, 0)} Thickness={2} />
                            </textlabel>

                            <textlabel
                                AutomaticSize={Enum.AutomaticSize.Y}
                                BackgroundTransparency={1}
                                FontFace={RobotoSlab}
                                Position={new UDim2(0, 0, 0, 20)}
                                Size={new UDim2(1, 0, 0, 0)}
                                Text="This item cannot be purchased anymore."
                                TextColor3={Color3.fromRGB(255, 220, 220)}
                                TextScaled={false}
                                TextSize={16}
                                TextWrapped={true}
                                TextXAlignment={Enum.TextXAlignment.Center}
                                TextYAlignment={Enum.TextYAlignment.Top}
                            >
                                <uistroke Color={Color3.fromRGB(100, 0, 0)} Thickness={1} />
                            </textlabel>
                        </frame>
                    </frame>
                )}
            </scrollingframe>
        </ItemWindow>
    );
}
