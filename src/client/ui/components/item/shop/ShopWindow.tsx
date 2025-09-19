import Signal from "@antivivi/lemon-signal";
import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from "@rbxts/react";
import useHotkeyWithTooltip from "client/ui/components/hotkeys/useHotkeyWithTooltip";
import InventoryFilter, {
    filterItems,
    useBasicInventoryFilter,
} from "client/ui/components/item/inventory/InventoryFilter";
import { PurchaseManager } from "client/ui/components/item/shop/PurchaseWindow";
import ShopItemSlot from "client/ui/components/item/shop/ShopItemSlot";
import { RobotoSlabHeavy } from "client/ui/GameFonts";
import useProperty from "client/ui/hooks/useProperty";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

const MemoizedShopItemSlot = memo(ShopItemSlot);

export class ShopManager {
    static readonly opened = new Signal<(shop?: Shop) => void>();

    static openShop(shop: Shop) {
        this.opened.fire(shop);
    }

    static closeShop() {
        this.opened.fire();
    }
}

/**
 * Main shop window component with integrated filtering
 */
export default function ShopWindow({
    shop: shopOverride,
    viewportManagement,
}: {
    shop?: Shop;
    viewportManagement?: ItemViewportManagement;
}) {
    const [shop, setShop] = useState<Shop | undefined>(shopOverride);
    const { searchQuery, props: filterProps } = useBasicInventoryFilter();
    const [hideMaxedItems, setHideMaxedItems] = useState(Packets.settings.get().HideMaxedItems);
    const ownedPerItem = useProperty(Packets.bought);
    const shopItems = shop?.items ?? [];
    const shopItemIds = useMemo(() => new Set(shopItems.map((item) => item.id)), [shopItems]);

    useEffect(() => {
        const settingsConnection = Packets.settings.observe((settings) => {
            setHideMaxedItems(settings.HideMaxedItems);
        });
        const openedConnection = ShopManager.opened.connect((newShop) => {
            setShop(newShop);
        });
        return () => {
            settingsConnection.disconnect();
            openedConnection.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!shopOverride) return;
        setShop(shopOverride);
    }, [shopOverride]);

    const dataPerItem = useMemo(() => {
        return filterItems(shopItems, searchQuery, filterProps.traitFilters);
    }, [shopItems, searchQuery, filterProps.traitFilters]);

    const handleItemClick = useCallback((item: Item) => {
        playSound("MenuClick.mp3");
        PurchaseManager.select(item);
    }, []);

    const { events } = useHotkeyWithTooltip({
        action: () => {
            if (!shop) return false;
            if (Packets.buyAllItems.toServer(shop.items.map((item) => item.id))) {
                playSound("ItemPurchase.mp3");
            } else {
                playSound("Error.mp3");
            }
            return true;
        },
        label: "Purchase All",
    });

    return (
        <Fragment>
            {/* Main container */}
            <uipadding
                PaddingBottom={new UDim(0, 5)}
                PaddingLeft={new UDim(0, 5)}
                PaddingRight={new UDim(0, 5)}
                PaddingTop={new UDim(0, 5)}
            />
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Filter options */}
            <InventoryFilter color={shop?.item.difficulty.color} {...filterProps} />

            {/* Item list scrolling frame */}
            <scrollingframe
                Active={true}
                AnchorPoint={new Vector2(0.5, 1)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                LayoutOrder={1}
                Position={new UDim2(0.5, 0, 1, 0)}
                ScrollBarThickness={6}
                Selectable={false}
                Size={new UDim2(1, -5, 0.9, 0)}
            >
                {/* Grid layout for items */}
                <uigridlayout
                    CellPadding={new UDim2(0, 12, 0, 12)}
                    CellSize={new UDim2(0.167, -12, 0, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                >
                    <uiaspectratioconstraint AspectRatio={0.8} AspectType={Enum.AspectType.ScaleWithParentSize} />
                </uigridlayout>

                {/* Padding */}
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />

                {/* Border stroke */}
                <uistroke Color={shop?.item.difficulty.color} Thickness={3} />

                {Items.sortedItems.map((item) => {
                    const itemId = item.id;
                    const data = dataPerItem.get(itemId);

                    return (
                        <MemoizedShopItemSlot
                            key={itemId}
                            item={item}
                            hideMaxedItems={hideMaxedItems}
                            ownedAmount={ownedPerItem.get(itemId) ?? 0}
                            layoutOrder={data?.layoutOrder}
                            visible={shopItemIds.has(itemId) && data?.visible === true}
                            onClick={() => handleItemClick(item)}
                            viewportManagement={viewportManagement}
                        />
                    );
                })}

                {/* Buy All button */}
                <frame BackgroundTransparency={1} LayoutOrder={99999} Size={new UDim2(0, 100, 0, 100)}>
                    <textbutton
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundColor3={Color3.fromRGB(85, 85, 255)}
                        BorderColor3={Color3.fromRGB(27, 42, 53)}
                        LayoutOrder={9999}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Selectable={false}
                        Size={new UDim2(0.7, 0, 0.6, 0)}
                        Text=""
                        Event={{
                            ...events,
                        }}
                    >
                        {/* Button stroke */}
                        <uistroke
                            ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                            Color={Color3.fromRGB(54, 44, 194)}
                            Thickness={3}
                        >
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                        new ColorSequenceKeypoint(0.597, Color3.fromRGB(156, 156, 156)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                    ])
                                }
                                Rotation={60}
                            />
                        </uistroke>

                        {/* Button gradient */}
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                ])
                            }
                            Rotation={270}
                        />

                        {/* Button padding */}
                        <uipadding
                            PaddingBottom={new UDim(0, 5)}
                            PaddingLeft={new UDim(0, 5)}
                            PaddingRight={new UDim(0, 5)}
                            PaddingTop={new UDim(0, 5)}
                        />

                        {/* Button layout */}
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 5)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />

                        {/* Button text */}
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabHeavy}
                            LayoutOrder={-5}
                            Size={new UDim2(1, 0, 1, 0)}
                            Text="Buy All Items"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={30}
                            TextWrapped={true}
                        >
                            <uistroke Color={Color3.fromRGB(5, 16, 0)} Thickness={2} />
                        </textlabel>
                    </textbutton>
                </frame>
            </scrollingframe>
        </Fragment>
    );
}
