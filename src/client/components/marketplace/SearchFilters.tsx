import React, { useEffect, useState } from "@rbxts/react";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";

export type MarketplaceSortOption = "price_asc" | "price_desc" | "created_asc" | "created_desc";

export default function SearchFilters({
    onSearch,
    onSort,
}: {
    onSearch: (query: string) => void;
    onSort: (sortBy: MarketplaceSortOption) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<MarketplaceSortOption>("created_desc");

    useEffect(() => {
        onSort(sortBy as MarketplaceSortOption);
    }, [sortBy]);

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
                    Size={new UDim2(0.75, -12, 0, 0)}
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
                        Text={""}
                        PlaceholderText="Search by item name or ID"
                        PlaceholderColor3={Color3.fromRGB(120, 140, 175)}
                        TextColor3={Color3.fromRGB(226, 238, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        FontFace={RobotoMono}
                        ClearTextOnFocus={false}
                        Change={{
                            Text: (textBox) => {
                                if (textBox.Text.size() > searchQuery.size()) {
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
                                setSearchQuery(textBox.Text);
                            },
                        }}
                        Event={{
                            FocusLost: (textBox, enterPressed) => {
                                setSearchQuery(textBox.Text);
                                if (enterPressed) onSearch(searchQuery);
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
                                const options: MarketplaceSortOption[] = [
                                    "created_desc",
                                    "created_asc",
                                    "price_asc",
                                    "price_desc",
                                ];
                                const currentIndex = options.indexOf(sortBy);
                                const nextIndex = (currentIndex + 1) % options.size();
                                setSortBy(options[nextIndex]);
                                playSound("CheckOn.mp3");
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
