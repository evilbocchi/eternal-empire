import { FuzzySearch } from "@rbxts/fuzzy-search";
import React, { useCallback, useMemo, useRef, useState } from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import { useMessageTooltip } from "../../tooltip/TooltipManager";

interface TraitFilterOption {
    id: TraitFilterId;
    image: string;
    color: Color3;
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

export type ItemFilterData = {
    layoutOrder: number;
    visible: boolean;
};

/**
 * Filters items based on search query and trait filters.
 * @param searchQuery The search query string.
 * @param traitFilters The selected trait filters.
 * @returns A map of item IDs to their layout order and visibility.
 */
export function filterItems(items: Item[], searchQuery: string, traitFilters: Set<TraitFilterId>) {
    const processedItems = new Set<string>();
    const dataPerItem = new Map<string, ItemFilterData>();

    if (searchQuery !== "") {
        const terms = new Array<string>();
        for (const item of items) {
            if (!isWhitelisted(item, traitFilters)) continue;
            terms.push(item.name);
        }
        const sorted = FuzzySearch.Sorting.FuzzyScore(terms, searchQuery);
        for (const [index, name] of sorted) {
            const item = Items.itemsPerName.get(name)!;
            if (processedItems.has(item.id)) continue; // Skip duplicates
            processedItems.add(item.id);
            dataPerItem.set(item.id, {
                layoutOrder: index,
                visible: index > 0,
            });
        }
    } else {
        for (const item of items) {
            if (!isWhitelisted(item, traitFilters)) continue;
            dataPerItem.set(item.id, {
                layoutOrder: item.layoutOrder,
                visible: true,
            });
        }
    }
    return dataPerItem;
}

/**
 * Inventory filter component with search and trait filtering
 */
export default function InventoryFilter({
    color = Color3.fromRGB(255, 186, 125),
    traitFilters,
    onSearchChange,
    onTraitToggle,
    onClear,
}: {
    /** Border color for the search box */
    color?: Color3;
    /** Currently selected trait filters */
    traitFilters: Set<TraitFilterId>;
    /** Callback when search query changes */
    onSearchChange: (query: string) => void;
    /** Callback when trait filter is toggled */
    onTraitToggle: (traitId: TraitFilterId) => void;
    /** Callback when clear button is pressed */
    onClear: () => void;
}) {
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
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                Padding={new UDim(0, 15)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding PaddingLeft={new UDim(0, 10)} />

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
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={color} Thickness={2} />
            </textbox>

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
                        ImageTransparency={traitFilters.has(trait.id) ? 0 : 0.6}
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

export function useBasicInventoryFilter() {
    const [searchQuery, setSearchQuery] = useState("");
    const [traitFilters, setTraitFilters] = useState<Set<TraitFilterId>>(new Set());

    // Handle search change
    const onSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Handle trait filter toggle
    const onTraitToggle = useCallback((traitId: TraitFilterId) => {
        setTraitFilters((prev) => {
            const newFilters = table.clone(prev);
            if (newFilters.has(traitId)) {
                playSound("CheckOff.mp3");
                newFilters.delete(traitId);
            } else {
                playSound("CheckOn.mp3");
                newFilters.add(traitId);
            }
            return newFilters;
        });
    }, []);

    // Handle filter clear
    const onClear = useCallback(() => {
        setTraitFilters(new Set());
    }, []);

    return {
        searchQuery,
        props: {
            traitFilters,
            onSearchChange,
            onTraitToggle,
            onClear,
        },
    };
}
