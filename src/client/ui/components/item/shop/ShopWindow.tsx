import React, { Fragment, useCallback, useMemo } from "@rbxts/react";
import InventoryFilter, {
    filterItems,
    useBasicInventoryFilter,
} from "client/ui/components/item/inventory/InventoryFilter";
import { loadItemViewportManagement } from "client/ui/components/item/ItemViewport";
import { PurchaseManager } from "client/ui/components/item/shop/PurchaseWindow";
import ShopItemSlot from "client/ui/components/item/shop/ShopItemSlot";
import { RobotoSlabHeavy } from "client/ui/GameFonts";
import useProperty from "client/ui/hooks/useProperty";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Packets from "shared/Packets";

interface ShopItem {
    item: Item;
    amountText: string;
    amountColor: Color3;
    isMaxed: boolean;
    layoutOrder: number;
}

interface ShopWindowProps {
    shop: Shop;
    /** Callback when buy all button is pressed */
    onBuyAll: () => void;
}

/**
 * Main shop window component with integrated filtering
 */
export default function ShopWindow({ shop, onBuyAll }: ShopWindowProps) {
    const { searchQuery, traitFilters, props: filterProps } = useBasicInventoryFilter();
    const viewportManagement = loadItemViewportManagement();
    const ownedPerItem = useProperty(Packets.bought);
    const shopItems = shop.items;

    const dataPerItem = useMemo(() => {
        return filterItems(searchQuery, traitFilters);
    }, [shopItems, searchQuery, traitFilters]);

    const handleItemClick = useCallback((item: Item) => {
        playSound("MenuClick.mp3");
        PurchaseManager.select(item);
    }, []);

    const handleBuyAllClick = useCallback(() => {
        playSound("MenuClick.mp3");
        onBuyAll();
    }, [onBuyAll]);

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
            <InventoryFilter color={shop.item.difficulty.color} {...filterProps} />

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
                <uistroke Color={shop.item.difficulty.color} Thickness={3} />

                {shopItems.map((item) => {
                    const data = dataPerItem.get(item.id);

                    return (
                        <ShopItemSlot
                            key={item.id}
                            item={item}
                            ownedAmount={ownedPerItem.get(item.id) ?? 0}
                            layoutOrder={data?.layoutOrder}
                            visible={data?.visible === true}
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
                            Activated: handleBuyAllClick,
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
