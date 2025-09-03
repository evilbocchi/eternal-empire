import React, { useCallback, useMemo, useRef, useState } from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import { useMessageTooltip } from "shared/ui/components/tooltip/useTooltipProps";

interface InventoryFilterProps {
    /** Available trait filter options */
    traitOptions: TraitFilterOption[];
    /** Callback when search query changes */
    onSearchChange: (query: string) => void;
    /** Callback when trait filter is toggled */
    onTraitToggle: (traitId: TraitFilterId) => void;
    /** Callback when clear button is pressed */
    onClear: () => void;
}

export const traitOptions: TraitFilterOption[] = [
    {
        id: "Dropper",
        image: getAsset("assets/indexing/Dropper.png"),
        color: Color3.fromRGB(255, 92, 92),
    },
    {
        id: "Furnace",
        image: getAsset("assets/indexing/Furnace.png"),
        color: Color3.fromRGB(255, 155, 74),
    },
    {
        id: "Upgrader",
        image: getAsset("assets/indexing/Upgrader.png"),
        color: Color3.fromRGB(245, 255, 58),
    },
    {
        id: "Conveyor",
        image: getAsset("assets/indexing/Conveyor.png"),
        color: Color3.fromRGB(131, 255, 78),
    },
    {
        id: "Generator",
        image: getAsset("assets/indexing/Generator.png"),
        color: Color3.fromRGB(60, 171, 255),
    },
    {
        id: "Charger",
        image: getAsset("assets/indexing/Charger.png"),
        color: Color3.fromRGB(255, 170, 255),
    },
    {
        id: "Miscellaneous",
        image: getAsset("assets/indexing/Miscellaneous.png"),
        color: Color3.fromRGB(170, 85, 255),
    },
];

/**
 * Checks if the item has any of the whitelisted traits enabled.
 * If the Miscellaneous trait is enabled, it will return true if no other traits are found.
 *
 * @param item The item to check.
 * @param whitelistedTraits The traits to check for.
 * @returns Whether the item is whitelisted.
 */
export function isWhitelisted(item: Item, whitelistedTraits: Set<TraitFilterId>) {
    if (whitelistedTraits.isEmpty()) return true;
    let isMisc = true;
    for (const traitOption of traitOptions) {
        const traitId = traitOption.id as TraitFilterId;
        if (item.isA(traitId as keyof ItemTraits)) {
            isMisc = false;
            if (whitelistedTraits.has(traitId)) return true;
        }
    }
    return isMisc && whitelistedTraits.has("Miscellaneous");
}

/**
 * Inventory filter component with search and trait filtering
 */
export default function InventoryFilter({
    traitOptions,
    onSearchChange,
    onTraitToggle,
    onClear,
}: InventoryFilterProps) {
    const textBoxRef = useRef<TextBox>();
    const [previousText, setPreviousText] = useState("");

    const handleSearchChange = useCallback(
        (rbx: TextBox) => {
            const text = rbx.Text;
            onSearchChange(text);
            if (text.size() > previousText.size()) {
                switch (math.random(1, 4)) {
                    case 1:
                        playSound("KeyPress1.mp3");
                        break;
                    case 2:
                        playSound("KeyPress2.mp3");
                        break;
                    case 3:
                        playSound("KeyPress3.mp3");
                        break;
                    case 4:
                        playSound("KeyPress4.mp3");
                        break;
                }
            } else {
                playSound("KeyDelete.mp3");
            }
            setPreviousText(text);
        },
        [onSearchChange],
    );

    // Generate tooltip props for each trait at the top level
    const tooltipPropsArray = traitOptions.map((trait) => ({
        id: trait.id,
        props: useMessageTooltip(trait.id),
    }));

    const tooltipPropsPerTrait = useMemo(() => {
        const tooltipProps = new Map<string, UseHoverReturn>();
        for (const { id, props } of tooltipPropsArray) {
            tooltipProps.set(id, props);
        }
        return tooltipProps;
    }, [tooltipPropsArray]);

    return (
        <frame BackgroundTransparency={1} LayoutOrder={-1} Size={new UDim2(1, 0, 0.025, 20)}>
            {/* Search textbox */}
            <textbox
                ref={textBoxRef}
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                ClearTextOnFocus={false}
                Font={Enum.Font.RobotoMono}
                LayoutOrder={2}
                PlaceholderText="Search..."
                Position={new UDim2(0, 0, 0, 5)}
                Size={new UDim2(0.4, 0, 1, 0)}
                Text={""}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextSize={25}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                ZIndex={100}
                Change={{
                    Text: handleSearchChange,
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
                    Active={true}
                    AnchorPoint={new Vector2(1, 0.5)}
                    BackgroundTransparency={1}
                    Event={{
                        Activated: () => {
                            setPreviousText("");
                            textBoxRef.current!.Text = "";
                        },
                    }}
                    Image={
                        previousText === ""
                            ? getAsset("assets/indexing/Search.png")
                            : getAsset("assets/indexing/Clear.png")
                    }
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
                            Activated: () => onTraitToggle(trait.id),
                            ...tooltipPropsPerTrait.get(trait.id)!.events,
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
                        Activated: onClear,
                    }}
                />
            </frame>
        </frame>
    );
}
