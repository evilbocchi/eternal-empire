import React, { useState, useEffect } from "@rbxts/react";
import { RobotoMonoBold, RobotoMono } from "shared/asset/GameFonts";

export default function SearchFilters({
    onSearch,
    onFilter,
}: {
    onSearch: (query: string) => void;
    onFilter: (filters: MarketplaceFilters) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<string>("created_desc");
    const [listingTypeFilter, setListingTypeFilter] = useState<string>("all");

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    const handleFilterChange = () => {
        const filters: MarketplaceFilters = {
            search: searchQuery !== "" ? searchQuery : undefined,
            sortBy: sortBy as "price_asc" | "price_desc" | "created_asc" | "created_desc",
            listingType: listingTypeFilter !== "all" ? (listingTypeFilter as "buyout" | "auction") : undefined,
        };
        onFilter(filters);
    };

    useEffect(() => {
        handleFilterChange();
    }, [sortBy, listingTypeFilter]);

    const sortLabel = (() => {
        switch (sortBy) {
            case "created_desc":
                return "Newest First";
            case "created_asc":
                return "Oldest First";
            case "price_asc":
                return "Price Low to High";
            default:
                return "Price High to Low";
        }
    })();

    const listingTypeLabel = (() => {
        switch (listingTypeFilter) {
            case "buyout":
                return "Buyout Only";
            case "auction":
                return "Auction Only";
            default:
                return "All Listings";
        }
    })();

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(18, 24, 36)}
            BorderColor3={Color3.fromRGB(255, 255, 255)}
            BorderSizePixel={2}
            Size={new UDim2(1, 0, 0, 0)}
            AutomaticSize={Enum.AutomaticSize.Y}
        >
            <uistroke Thickness={1} Color={Color3.fromRGB(58, 86, 142)} />
            <uigradient
                Rotation={0}
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(20, 26, 39)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(12, 16, 24)),
                    ])
                }
            />
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} ZIndex={1}>
                <uipadding
                    PaddingTop={new UDim(0, 6)}
                    PaddingBottom={new UDim(0, 6)}
                    PaddingLeft={new UDim(0, 6)}
                    PaddingRight={new UDim(0, 6)}
                />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    Padding={new UDim(0, 6)}
                />

                {/* Search Box */}
                <frame
                    BackgroundTransparency={1}
                    LayoutOrder={1}
                    Size={new UDim2(0.5, -12, 0, 0)}
                    AutomaticSize={Enum.AutomaticSize.Y}
                >
                    <uipadding
                        PaddingTop={new UDim(0, 6)}
                        PaddingBottom={new UDim(0, 6)}
                        PaddingLeft={new UDim(0, 6)}
                        PaddingRight={new UDim(0, 6)}
                    />
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Vertical}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        VerticalAlignment={Enum.VerticalAlignment.Top}
                        Padding={new UDim(0, 8)}
                    />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(1, 0, 0, 20)}
                        Text="Search Items"
                        TextColor3={Color3.fromRGB(204, 222, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    />

                    <textbox
                        BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                        BorderColor3={Color3.fromRGB(100, 100, 100)}
                        BorderSizePixel={1}
                        Size={new UDim2(1, 0, 0, 26)}
                        Text={searchQuery}
                        PlaceholderText="Search by item name or ID"
                        PlaceholderColor3={Color3.fromRGB(120, 140, 175)}
                        TextColor3={Color3.fromRGB(226, 238, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        FontFace={RobotoMono}
                        ClearTextOnFocus={false}
                        Event={{
                            FocusLost: (textBox, enterPressed) => {
                                setSearchQuery(textBox.Text);
                                if (enterPressed) handleSearch();
                            },
                        }}
                    >
                        <uipadding
                            PaddingTop={new UDim(0, 4)}
                            PaddingBottom={new UDim(0, 4)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                        />
                    </textbox>
                </frame>

                {/* Sort Dropdown */}
                <frame
                    BackgroundTransparency={1}
                    LayoutOrder={2}
                    Size={new UDim2(0.25, -6, 0, 0)}
                    AutomaticSize={Enum.AutomaticSize.Y}
                >
                    <uipadding
                        PaddingTop={new UDim(0, 6)}
                        PaddingBottom={new UDim(0, 6)}
                        PaddingLeft={new UDim(0, 6)}
                        PaddingRight={new UDim(0, 6)}
                    />
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Vertical}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        VerticalAlignment={Enum.VerticalAlignment.Top}
                        Padding={new UDim(0, 8)}
                    />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(1, 0, 0, 20)}
                        Text="Sort By"
                        TextColor3={Color3.fromRGB(204, 222, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    />

                    <textbutton
                        BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                        BorderColor3={Color3.fromRGB(100, 100, 100)}
                        BorderSizePixel={1}
                        Size={new UDim2(1, 0, 0, 26)}
                        Text={sortLabel}
                        TextColor3={Color3.fromRGB(226, 238, 255)}
                        TextScaled={true}
                        FontFace={RobotoMono}
                        Event={{
                            Activated: () => {
                                const options = ["created_desc", "created_asc", "price_asc", "price_desc"];
                                const currentIndex = options.indexOf(sortBy);
                                const nextIndex = (currentIndex + 1) % options.size();
                                setSortBy(options[nextIndex]);
                            },
                        }}
                    >
                        <uipadding
                            PaddingTop={new UDim(0, 4)}
                            PaddingBottom={new UDim(0, 4)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                        />
                    </textbutton>
                </frame>

                {/* Listing Type Filter */}
                <frame
                    BackgroundTransparency={1}
                    LayoutOrder={3}
                    Size={new UDim2(0.25, -6, 0, 0)}
                    AutomaticSize={Enum.AutomaticSize.Y}
                >
                    <uipadding
                        PaddingTop={new UDim(0, 6)}
                        PaddingBottom={new UDim(0, 6)}
                        PaddingLeft={new UDim(0, 6)}
                        PaddingRight={new UDim(0, 6)}
                    />
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Vertical}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        VerticalAlignment={Enum.VerticalAlignment.Top}
                        Padding={new UDim(0, 8)}
                    />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(1, 0, 0, 20)}
                        Text="Type Filter"
                        TextColor3={Color3.fromRGB(204, 222, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    />

                    <textbutton
                        BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                        BorderColor3={Color3.fromRGB(100, 100, 100)}
                        BorderSizePixel={1}
                        Size={new UDim2(1, 0, 0, 26)}
                        Text={listingTypeLabel}
                        TextColor3={Color3.fromRGB(226, 238, 255)}
                        TextScaled={true}
                        FontFace={RobotoMono}
                        Event={{
                            Activated: () => {
                                const options = ["all", "buyout", "auction"];
                                const currentIndex = options.indexOf(listingTypeFilter);
                                const nextIndex = (currentIndex + 1) % options.size();
                                setListingTypeFilter(options[nextIndex]);
                            },
                        }}
                    >
                        <uipadding
                            PaddingTop={new UDim(0, 4)}
                            PaddingBottom={new UDim(0, 4)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                        />
                    </textbutton>
                </frame>
            </frame>
        </frame>
    );
}
