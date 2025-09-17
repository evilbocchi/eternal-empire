import React, { Fragment, useCallback, useState } from "@rbxts/react";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import InventoryFilter, { isWhitelisted, traitOptions } from "../inventory/InventoryFilter";
import ShopItemSlot from "./ShopItemSlot";

interface ShopItem {
    item: Item;
    amountText: string;
    amountColor: Color3;
    isMaxed: boolean;
    layoutOrder: number;
}

interface ShopWindowProps {
    /** Array of shop items to display */
    shopItems: ShopItem[];
    /** Currently selected item for purchase */
    selectedItem?: Item;
    /** Whether the purchase window is visible */
    isPurchaseWindowVisible: boolean;
    /** Callback when an item is selected for purchase */
    onItemSelect: (item: Item) => void;
    /** Callback when buy all button is pressed */
    onBuyAll: () => void;
    /** Shop difficulty color for styling */
    shopColor?: Color3;
}

/**
 * Main shop window component with integrated filtering
 */
export default function ShopWindow({
    shopItems,
    selectedItem,
    isPurchaseWindowVisible,
    onItemSelect,
    onBuyAll,
    shopColor = Color3.fromRGB(255, 255, 255),
}: ShopWindowProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTraits, setSelectedTraits] = useState<Set<TraitFilterId>>(new Set());

    // Prepare trait options with selection state
    const traitOptionsWithSelection = traitOptions.map((option) => ({
        ...option,
        selected: selectedTraits.has(option.id),
    }));

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleTraitToggle = useCallback((traitId: TraitFilterId) => {
        playSound("MenuClick.mp3");
        setSelectedTraits((prev) => {
            const newSet = new Set<TraitFilterId>();
            prev.forEach((trait) => newSet.add(trait));
            if (newSet.has(traitId)) {
                newSet.delete(traitId);
            } else {
                newSet.add(traitId);
            }
            return newSet;
        });
    }, []);

    const handleClear = useCallback(() => {
        playSound("MenuClick.mp3");
        setSearchQuery("");
        setSelectedTraits(new Set());
    }, []);

    const handleItemClick = useCallback(
        (item: Item) => {
            playSound("MenuClick.mp3");
            onItemSelect(item);
        },
        [onItemSelect],
    );

    const handleBuyAllClick = useCallback(() => {
        playSound("MenuClick.mp3");
        onBuyAll();
    }, [onBuyAll]);

    // Filter shop items based on search and traits
    const filteredItems = shopItems.filter((shopItem) => {
        const { item } = shopItem;

        // Search filter
        if (searchQuery !== "" && !item.name.lower().find(searchQuery.lower())[0]) {
            return false;
        }

        // Trait filter
        if (!isWhitelisted(item, selectedTraits)) {
            return false;
        }

        return true;
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

            {/* Filter options */}
            <InventoryFilter
                traitOptions={traitOptionsWithSelection}
                onSearchChange={handleSearchChange}
                onTraitToggle={handleTraitToggle}
                onClear={handleClear}
            />

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
                    <uiaspectratioconstraint AspectRatio={1.5} AspectType={Enum.AspectType.ScaleWithParentSize} />
                </uigridlayout>

                {/* Padding */}
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />

                {/* Border stroke */}
                <uistroke Color={shopColor} Thickness={3} />

                {/* Render filtered shop items */}
                {filteredItems.map((shopItem, index) => (
                    <ShopItemSlot
                        key={shopItem.item.id}
                        item={shopItem.item}
                        amountText={shopItem.amountText}
                        amountColor={shopItem.amountColor}
                        isMaxed={shopItem.isMaxed}
                        layoutOrder={index}
                        onClick={() => handleItemClick(shopItem.item)}
                    />
                ))}

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
                            Font={Enum.Font.Unknown}
                            FontFace={new Font("rbxassetid://12187368625", Enum.FontWeight.Bold, Enum.FontStyle.Normal)}
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
