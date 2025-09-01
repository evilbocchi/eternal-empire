/**
 * @fileoverview Inventory filter React component
 * 
 * Provides search and trait filtering functionality for the inventory.
 * Replaces the traditional FilterOptions with React implementation.
 */

import React, { useCallback } from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";

interface TraitOption {
    id: string;
    image: string;
    color: Color3;
    selected: boolean;
}

interface InventoryFilterProps {
    /** Current search query */
    searchQuery: string;
    /** Available trait filter options */
    traitOptions: TraitOption[];
    /** Callback when search query changes */
    onSearchChange: (query: string) => void;
    /** Callback when trait filter is toggled */
    onTraitToggle: (traitId: string) => void;
    /** Callback when clear button is pressed */
    onClear: () => void;
}

/**
 * Inventory filter component with search and trait filtering
 */
export default function InventoryFilter({ 
    searchQuery, 
    traitOptions, 
    onSearchChange, 
    onTraitToggle, 
    onClear 
}: InventoryFilterProps) {
    const handleSearchChange = useCallback((rbx: TextBox) => {
        onSearchChange(rbx.Text);
    }, [onSearchChange]);

    return (
        <frame
            BackgroundTransparency={1}
            LayoutOrder={-1}
            Size={new UDim2(1, 0, 0.025, 20)}
        >
            {/* Search textbox */}
            <textbox
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                ClearTextOnFocus={false}
                Font={Enum.Font.RobotoMono}
                LayoutOrder={2}
                PlaceholderText="Search..."
                Position={new UDim2(0, 0, 0, 5)}
                Size={new UDim2(0.4, 0, 1, 0)}
                Text={searchQuery}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextSize={25}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                ZIndex={100}
                Change={{
                    Text: handleSearchChange
                }}
            >
                {/* Search box padding */}
                <uipadding
                    PaddingBottom={new UDim(0, 5)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 5)}
                    PaddingTop={new UDim(0, 5)}
                />
                
                {/* Search icon */}
                <imagebutton
                    AnchorPoint={new Vector2(1, 0.5)}
                    BackgroundTransparency={1}
                    Image="rbxassetid://5492253050"
                    ImageColor3={Color3.fromRGB(143, 143, 143)}
                    ImageTransparency={0.5}
                    Position={new UDim2(1, 0, 0.5, 0)}
                    ScaleType={Enum.ScaleType.Fit}
                    Selectable={false}
                    Size={new UDim2(1, 0, 0.7, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
                
                {/* Search box border */}
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(255, 186, 125)}
                    Thickness={2}
                />
            </textbox>

            {/* Filter layout */}
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 15)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Trait filter options */}
            <frame
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                LayoutOrder={2}
                Size={new UDim2(0, 0, 1, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    Padding={new UDim(0, 6)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Render trait filter buttons */}
                {traitOptions.map((trait, index) => (
                    <imagebutton
                        key={trait.id}
                        BackgroundTransparency={1}
                        Image={trait.image}
                        ImageColor3={trait.color}
                        ImageTransparency={trait.selected ? 0 : 0.6}
                        LayoutOrder={index + 1}
                        ScaleType={Enum.ScaleType.Fit}
                        Size={new UDim2(1, 0, 1, 0)}
                        Event={{
                            Activated: () => onTraitToggle(trait.id)
                        }}
                    >
                        <uipadding
                            PaddingBottom={new UDim(0, 5)}
                            PaddingLeft={new UDim(0, 5)}
                            PaddingRight={new UDim(0, 5)}
                            PaddingTop={new UDim(0, 5)}
                        />
                        <uiaspectratioconstraint />
                    </imagebutton>
                ))}

                {/* Clear button */}
                <textbutton
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    Font={Enum.Font.SourceSans}
                    LayoutOrder={99}
                    Size={new UDim2(0, 0, 0.5, 0)}
                    Text="Clear"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextTransparency={0.5}
                    TextWrapped={true}
                    Event={{
                        Activated: onClear
                    }}
                />
            </frame>
        </frame>
    );
}