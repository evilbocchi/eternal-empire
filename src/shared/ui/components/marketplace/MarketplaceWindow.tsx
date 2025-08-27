import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect, useState } from "@rbxts/react";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import "shared/marketplace/MarketplaceListing";
import Packets from "shared/Packets";
import { RobotoSlab, RobotoSlabBold } from "shared/ui/GameFonts";
import ActionButton from "../printer/ActionButton";
import CurrencyDisplay from "./CurrencyDisplay";

interface MarketplaceWindowProps {
    visible: boolean;
    onClose: () => void;
}

type TabType = "Browse" | "MyListings" | "CreateListing";

interface ListingCardProps {
    listing: MarketplaceListing;
    onBuy?: (uuid: string) => void;
    onBid?: (uuid: string, amount: number) => void;
    onCancel?: (uuid: string) => void;
    isOwner?: boolean;
}

interface CreateListingFormProps {
    onSubmit: (uuid: string, price: number, listingType: "buyout" | "auction", duration: number) => void;
}

interface SearchFiltersProps {
    onSearch: (query: string) => void;
    onFilter: (filters: MarketplaceFilters) => void;
}

// Listing Card Component
export function ListingCard({ listing, onBuy, onBid, onCancel, isOwner = false }: ListingCardProps) {
    const [bidAmount, setBidAmount] = useState("");
    const [showBidInput, setShowBidInput] = useState(false);

    const handleBuy = () => {
        if (onBuy) onBuy(listing.uuid);
    };

    const handleBid = () => {
        if (onBid && bidAmount !== "") {
            onBid(listing.uuid, tonumber(bidAmount) ?? 0);
            setBidAmount("");
            setShowBidInput(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) onCancel(listing.uuid);
    };

    const formatTimeRemaining = (expires?: number): string => {
        if (!expires) return "No expiry";
        const now = os.time();
        const remaining = expires - now;
        if (remaining <= 0) return "Expired";

        const days = math.floor(remaining / (24 * 60 * 60));
        const hours = math.floor((remaining % (24 * 60 * 60)) / (60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(50, 50, 50)}
            BorderSizePixel={0}
            Size={new UDim2(1, -10, 0, 120)}
            AutomaticSize={Enum.AutomaticSize.Y}
        >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uistroke Thickness={1} Color={Color3.fromRGB(80, 80, 80)} />

            {/* Item Info Section */}
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(0.6, 0, 1, 0)}
                Position={new UDim2(0, 10, 0, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    Padding={new UDim(0, 5)}
                />

                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(1, 0, 0, 25)}
                    Text={`Item: ${listing.uuid.sub(1, 8)}...`} // Truncated UUID
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 20)}>
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Size={new UDim2(0, 50, 1, 0)}
                        Text="Price: "
                        TextColor3={Color3.fromRGB(200, 200, 200)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={1} />
                    </textlabel>

                    <frame
                        BackgroundTransparency={1}
                        Size={new UDim2(1, -50, 1, 0)}
                        Position={new UDim2(0, 50, 0, 0)}
                    >
                        <CurrencyDisplay
                            currencyBundle={new CurrencyBundle().set("Diamonds", new OnoeNum(listing.price))}
                            size={new UDim2(1, 0, 1, 0)}
                        />
                    </frame>
                </frame>

                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Size={new UDim2(1, 0, 0, 20)}
                    Text={`Type: ${listing.listingType === "buyout" ? "Buyout" : "Auction"}`}
                    TextColor3={listing.listingType === "buyout" ? Color3.fromRGB(200, 200, 255) : Color3.fromRGB(255, 200, 200)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Size={new UDim2(1, 0, 0, 20)}
                    Text={`Expires: ${formatTimeRemaining(listing.expires)}`}
                    TextColor3={Color3.fromRGB(200, 200, 200)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                {listing.currentBid !== undefined && (
                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 20)}>
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlab}
                            Size={new UDim2(0, 80, 1, 0)}
                            Text="Current Bid: "
                            TextColor3={Color3.fromRGB(200, 200, 200)}
                            TextScaled={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        >
                            <uistroke Thickness={1} />
                        </textlabel>

                        <frame
                            BackgroundTransparency={1}
                            Size={new UDim2(1, -80, 1, 0)}
                            Position={new UDim2(0, 80, 0, 0)}
                        >
                            <CurrencyDisplay
                                currencyBundle={new CurrencyBundle().set("Diamonds", new OnoeNum(listing.currentBid))}
                                size={new UDim2(1, 0, 1, 0)}
                                textColor={Color3.fromRGB(255, 255, 150)}
                            />
                        </frame>
                    </frame>
                )}
            </frame>

            {/* Action Buttons Section */}
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(0.35, 0, 1, 0)}
                Position={new UDim2(0.65, 0, 0, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                    Padding={new UDim(0, 5)}
                />

                {isOwner ? (
                    <ActionButton
                        text="Cancel"
                        backgroundColor={Color3.fromRGB(200, 50, 50)}
                        onClick={handleCancel}
                    />
                ) : (
                    <>
                        {listing.listingType === "buyout" && (
                            <ActionButton
                                text="Buy Now"
                                backgroundColor={Color3.fromRGB(50, 200, 50)}
                                onClick={handleBuy}
                            />
                        )}

                        {listing.listingType === "auction" && (
                            <>
                                {!showBidInput ? (
                                    <ActionButton
                                        text="Place Bid"
                                        backgroundColor={Color3.fromRGB(50, 100, 200)}
                                        onClick={() => setShowBidInput(true)}
                                    />
                                ) : (
                                    <frame
                                        BackgroundTransparency={1}
                                        Size={new UDim2(1, 0, 0, 60)}
                                    >
                                        <textbox
                                            BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                                            BorderSizePixel={0}
                                            Size={new UDim2(1, 0, 0, 30)}
                                            Position={new UDim2(0, 0, 0, 0)}
                                            Text={bidAmount}
                                            PlaceholderText="Enter bid amount"
                                            TextColor3={Color3.fromRGB(255, 255, 255)}
                                            TextScaled={true}
                                            FontFace={RobotoSlab}
                                            ClearTextOnFocus={false}
                                            Event={{
                                                FocusLost: (textBox) => setBidAmount(textBox.Text)
                                            }}
                                        >
                                            <uicorner CornerRadius={new UDim(0, 4)} />
                                        </textbox>

                                        <frame
                                            BackgroundTransparency={1}
                                            Size={new UDim2(1, 0, 0, 25)}
                                            Position={new UDim2(0, 0, 0, 35)}
                                        >
                                            <uilistlayout
                                                FillDirection={Enum.FillDirection.Horizontal}
                                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                                Padding={new UDim(0, 5)}
                                            />

                                            <textbutton
                                                BackgroundColor3={Color3.fromRGB(50, 150, 50)}
                                                BorderSizePixel={0}
                                                Size={new UDim2(0, 40, 1, 0)}
                                                Text="Bid"
                                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                                TextScaled={true}
                                                FontFace={RobotoSlab}
                                                Event={{ Activated: handleBid }}
                                            >
                                                <uicorner CornerRadius={new UDim(0, 4)} />
                                            </textbutton>

                                            <textbutton
                                                BackgroundColor3={Color3.fromRGB(150, 50, 50)}
                                                BorderSizePixel={0}
                                                Size={new UDim2(0, 50, 1, 0)}
                                                Text="Cancel"
                                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                                TextScaled={true}
                                                FontFace={RobotoSlab}
                                                Event={{ Activated: () => setShowBidInput(false) }}
                                            >
                                                <uicorner CornerRadius={new UDim(0, 4)} />
                                            </textbutton>
                                        </frame>
                                    </frame>
                                )}
                            </>
                        )}
                    </>
                )}
            </frame>
        </frame>
    );
}

// Search and Filters Component
export function SearchFilters({ onSearch, onFilter }: SearchFiltersProps) {
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

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(45, 45, 45)}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, 80)}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0, 10)}
            />

            {/* Search Box */}
            <frame BackgroundTransparency={1} Size={new UDim2(0, 300, 0, 60)}>
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Size={new UDim2(1, 0, 0, 20)}
                    Position={new UDim2(0, 0, 0, 0)}
                    Text="Search Items"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                <textbox
                    BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0, 35)}
                    Position={new UDim2(0, 0, 0, 25)}
                    Text={searchQuery}
                    PlaceholderText="Search by item name or ID..."
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    FontFace={RobotoSlab}
                    ClearTextOnFocus={false}
                    Event={{
                        FocusLost: (textBox, enterPressed) => {
                            setSearchQuery(textBox.Text);
                            if (enterPressed) handleSearch();
                        }
                    }}
                >
                    <uicorner CornerRadius={new UDim(0, 4)} />
                    <uistroke Thickness={1} Color={Color3.fromRGB(100, 100, 100)} />
                </textbox>
            </frame>

            {/* Sort Dropdown */}
            <frame BackgroundTransparency={1} Size={new UDim2(0, 200, 0, 60)}>
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Size={new UDim2(1, 0, 0, 20)}
                    Position={new UDim2(0, 0, 0, 0)}
                    Text="Sort By"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                <textbutton
                    BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0, 35)}
                    Position={new UDim2(0, 0, 0, 25)}
                    Text={sortBy === "created_desc" ? "Newest First" :
                        sortBy === "created_asc" ? "Oldest First" :
                            sortBy === "price_asc" ? "Price Low to High" : "Price High to Low"}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    FontFace={RobotoSlab}
                    Event={{
                        Activated: () => {
                            // Cycle through sort options
                            const options = ["created_desc", "created_asc", "price_asc", "price_desc"];
                            const currentIndex = options.indexOf(sortBy);
                            const nextIndex = (currentIndex + 1) % options.size();
                            setSortBy(options[nextIndex]);
                        }
                    }}
                >
                    <uicorner CornerRadius={new UDim(0, 4)} />
                    <uistroke Thickness={1} Color={Color3.fromRGB(100, 100, 100)} />
                </textbutton>
            </frame>

            {/* Listing Type Filter */}
            <frame BackgroundTransparency={1} Size={new UDim2(0, 150, 0, 60)}>
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Size={new UDim2(1, 0, 0, 20)}
                    Position={new UDim2(0, 0, 0, 0)}
                    Text="Type Filter"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                <textbutton
                    BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0, 35)}
                    Position={new UDim2(0, 0, 0, 25)}
                    Text={listingTypeFilter === "all" ? "All Types" :
                        listingTypeFilter === "buyout" ? "Buyout Only" : "Auction Only"}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    FontFace={RobotoSlab}
                    Event={{
                        Activated: () => {
                            const options = ["all", "buyout", "auction"];
                            const currentIndex = options.indexOf(listingTypeFilter);
                            const nextIndex = (currentIndex + 1) % options.size();
                            setListingTypeFilter(options[nextIndex]);
                        }
                    }}
                >
                    <uicorner CornerRadius={new UDim(0, 4)} />
                    <uistroke Thickness={1} Color={Color3.fromRGB(100, 100, 100)} />
                </textbutton>
            </frame>
        </frame>
    );
}

// Create Listing Form Component
export function CreateListingForm({ onSubmit }: CreateListingFormProps) {
    const [selectedUuid, setSelectedUuid] = useState("");
    const [price, setPrice] = useState("");
    const [listingType, setListingType] = useState<"buyout" | "auction">("buyout");
    const [duration, setDuration] = useState("7"); // days
    const [availableItems, setAvailableItems] = useState<string[]>([]);

    // Load player's available unique items
    useEffect(() => {
        const uniqueInstances = Packets.uniqueInstances.get() ?? new Map();
        const items: string[] = [];
        for (const [uuid, item] of uniqueInstances) {
            // Only include items that aren't placed
            if (!item.placed) {
                items.push(uuid);
            }
        }
        setAvailableItems(items);
    }, []);

    const handleSubmit = () => {
        if (selectedUuid === "" || price === "") return;

        const priceNum = tonumber(price);
        if (!priceNum || priceNum <= 0) return;

        const durationNum = tonumber(duration);
        if (!durationNum || durationNum <= 0) return;

        onSubmit(selectedUuid, priceNum, listingType, durationNum * 24 * 60 * 60);

        // Reset form
        setSelectedUuid("");
        setPrice("");
        setDuration("7");
    };

    return (
        <frame
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 1, 0)}
        >
            <scrollingframe
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, 0)}
                ScrollBarThickness={8}
                CanvasSize={new UDim2(0, 0, 0, 400)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    Padding={new UDim(0, 20)}
                />

                {/* Title */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(0.8, 0, 0, 40)}
                    Text="Create New Listing"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                >
                    <uistroke Thickness={2} />
                </textlabel>

                {/* Item Selection */}
                <frame
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                    BorderSizePixel={0}
                    Size={new UDim2(0.8, 0, 0, 100)}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Size={new UDim2(1, 0, 0, 25)}
                        Position={new UDim2(0, 10, 0, 5)}
                        Text="Select Item to List"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={1} />
                    </textlabel>

                    <scrollingframe
                        BackgroundTransparency={1}
                        Size={new UDim2(1, -20, 0, 65)}
                        Position={new UDim2(0, 10, 0, 30)}
                        ScrollBarThickness={6}
                        CanvasSize={new UDim2(0, availableItems.size() * 120, 0, 0)}
                        ScrollingDirection={Enum.ScrollingDirection.X}
                    >
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            HorizontalAlignment={Enum.HorizontalAlignment.Left}
                            Padding={new UDim(0, 5)}
                        />

                        {availableItems.map((uuid, index) => (
                            <textbutton
                                key={`item-${uuid}`}
                                BackgroundColor3={selectedUuid === uuid ? Color3.fromRGB(100, 150, 100) : Color3.fromRGB(60, 60, 60)}
                                BorderSizePixel={0}
                                Size={new UDim2(0, 110, 1, 0)}
                                Text={`${uuid.sub(1, 8)}...`}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={true}
                                FontFace={RobotoSlab}
                                Event={{
                                    Activated: () => setSelectedUuid(uuid)
                                }}
                            >
                                <uicorner CornerRadius={new UDim(0, 4)} />
                                <uistroke Thickness={1} Color={selectedUuid === uuid ? Color3.fromRGB(150, 200, 150) : Color3.fromRGB(100, 100, 100)} />
                            </textbutton>
                        ))}
                    </scrollingframe>
                </frame>

                {/* Price Input */}
                <frame
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                    BorderSizePixel={0}
                    Size={new UDim2(0.8, 0, 0, 80)}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Size={new UDim2(1, 0, 0, 25)}
                        Position={new UDim2(0, 10, 0, 5)}
                        Text="Set Price"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={1} />
                    </textlabel>

                    <textbox
                        BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                        BorderSizePixel={0}
                        Size={new UDim2(1, -20, 0, 40)}
                        Position={new UDim2(0, 10, 0, 30)}
                        Text={price}
                        PlaceholderText="Enter price amount..."
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        FontFace={RobotoSlab}
                        ClearTextOnFocus={false}
                        Event={{
                            FocusLost: (textBox) => setPrice(textBox.Text)
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 4)} />
                        <uistroke Thickness={1} Color={Color3.fromRGB(100, 100, 100)} />
                    </textbox>
                </frame>

                {/* Listing Type Selection */}
                <frame
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                    BorderSizePixel={0}
                    Size={new UDim2(0.8, 0, 0, 80)}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Size={new UDim2(1, 0, 0, 25)}
                        Position={new UDim2(0, 10, 0, 5)}
                        Text="Listing Type"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={1} />
                    </textlabel>

                    <frame
                        BackgroundTransparency={1}
                        Size={new UDim2(1, -20, 0, 40)}
                        Position={new UDim2(0, 10, 0, 30)}
                    >
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            HorizontalAlignment={Enum.HorizontalAlignment.Left}
                            Padding={new UDim(0, 10)}
                        />

                        <textbutton
                            BackgroundColor3={listingType === "buyout" ? Color3.fromRGB(100, 150, 100) : Color3.fromRGB(60, 60, 60)}
                            BorderSizePixel={0}
                            Size={new UDim2(0, 120, 1, 0)}
                            Text="Buyout"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            FontFace={RobotoSlab}
                            Event={{
                                Activated: () => setListingType("buyout")
                            }}
                        >
                            <uicorner CornerRadius={new UDim(0, 4)} />
                            <uistroke Thickness={1} Color={listingType === "buyout" ? Color3.fromRGB(150, 200, 150) : Color3.fromRGB(100, 100, 100)} />
                        </textbutton>

                        <textbutton
                            BackgroundColor3={listingType === "auction" ? Color3.fromRGB(150, 100, 100) : Color3.fromRGB(60, 60, 60)}
                            BorderSizePixel={0}
                            Size={new UDim2(0, 120, 1, 0)}
                            Text="Auction"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            FontFace={RobotoSlab}
                            Event={{
                                Activated: () => setListingType("auction")
                            }}
                        >
                            <uicorner CornerRadius={new UDim(0, 4)} />
                            <uistroke Thickness={1} Color={listingType === "auction" ? Color3.fromRGB(200, 150, 150) : Color3.fromRGB(100, 100, 100)} />
                        </textbutton>
                    </frame>
                </frame>

                {/* Duration Input */}
                <frame
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                    BorderSizePixel={0}
                    Size={new UDim2(0.8, 0, 0, 80)}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Size={new UDim2(1, 0, 0, 25)}
                        Position={new UDim2(0, 10, 0, 5)}
                        Text="Duration (Days)"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={1} />
                    </textlabel>

                    <textbox
                        BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                        BorderSizePixel={0}
                        Size={new UDim2(1, -20, 0, 40)}
                        Position={new UDim2(0, 10, 0, 30)}
                        Text={duration}
                        PlaceholderText="7"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        FontFace={RobotoSlab}
                        ClearTextOnFocus={false}
                        Event={{
                            FocusLost: (textBox) => setDuration(textBox.Text)
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 4)} />
                        <uistroke Thickness={1} Color={Color3.fromRGB(100, 100, 100)} />
                    </textbox>
                </frame>

                {/* Submit Button */}
                <frame
                    BackgroundTransparency={1}
                    Size={new UDim2(0.8, 0, 0, 60)}
                >
                    <ActionButton
                        text="Create Listing"
                        backgroundColor={Color3.fromRGB(50, 150, 50)}
                        onClick={handleSubmit}
                    />
                </frame>
            </scrollingframe>
        </frame>
    );
}

// Main Marketplace Window Component
export default function MarketplaceWindow({ visible, onClose }: MarketplaceWindowProps) {
    const [activeTab, setActiveTab] = useState<TabType>("Browse");
    const [listings, setListings] = useState<Map<string, MarketplaceListing>>(new Map());
    const [myListings, setMyListings] = useState<Map<string, MarketplaceListing>>(new Map());
    const [isEnabled, setIsEnabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<MarketplaceFilters>({});

    // Load data when window becomes visible
    useEffect(() => {
        if (visible) {
            // Request fresh data
            Packets.getMarketplaceListings.invoke();

            // Get current state
            const currentListings = Packets.marketplaceListings.get();
            const currentMyListings = Packets.myActiveListings.get();
            const marketplaceEnabled = Packets.marketplaceEnabled.get();

            if (currentListings)
                setListings(currentListings);
            if (currentMyListings)
                setMyListings(currentMyListings);
            if (marketplaceEnabled)
                setIsEnabled(marketplaceEnabled);
        }
    }, [visible]);

    // Set up packet listeners
    useEffect(() => {
        const connections: RBXScriptConnection[] = [];

        connections.push(
            Packets.marketplaceListings.observe((newListings) => {
                setListings(newListings);
            })
        );

        connections.push(
            Packets.myActiveListings.observe((newMyListings) => {
                setMyListings(newMyListings);
            })
        );

        connections.push(
            Packets.marketplaceEnabled.observe((enabled) => {
                setIsEnabled(enabled);
            })
        );

        return () => {
            connections.forEach(conn => conn.Disconnect());
        };
    }, []);

    const handleBuyItem = (uuid: string) => {
        Packets.buyItem.invoke(uuid);
    };

    const handlePlaceBid = (uuid: string, bidAmount: number) => {
        Packets.placeBid.invoke(uuid, bidAmount);
    };

    const handleCancelListing = (uuid: string) => {
        Packets.cancelListing.invoke(uuid);
    };

    const handleCreateListing = (uuid: string, price: number, listingType: "buyout" | "auction", duration: number) => {
        Packets.createListing.invoke(uuid, price, listingType, duration);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Trigger search logic here
    };

    const handleFilter = (newFilters: MarketplaceFilters) => {
        setFilters(newFilters);
        // Trigger filter logic here
    };

    const filteredListings = React.useMemo(() => {
        let result = new Map<string, MarketplaceListing>();

        // Copy all listings first
        for (const [uuid, listing] of listings) {
            result.set(uuid, listing);
        }

        // Apply search filter
        if (searchQuery !== "") {
            const filtered = new Map<string, MarketplaceListing>();
            for (const [uuid, listing] of result) {
                if (string.find(uuid.lower(), searchQuery.lower())[0] !== undefined) {
                    filtered.set(uuid, listing);
                }
            }
            result = filtered;
        }

        return result;
    }, [listings, searchQuery, filters]); if (!visible) return <></>;

    return (
        <screengui ResetOnSpawn={false}>
            <frame
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.85, 0, 0.85, 0)}
            >
                <uicorner CornerRadius={new UDim(0, 12)} />
                <uistroke Thickness={2} Color={Color3.fromRGB(80, 80, 80)} />

                {/* Title Bar */}
                <frame
                    BackgroundColor3={Color3.fromRGB(30, 30, 30)}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0, 50)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0, 15, 0, 0)}
                        Size={new UDim2(0.7, 0, 1, 0)}
                        Text="Marketplace"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    {!isEnabled && (
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlab}
                            Position={new UDim2(0.3, 0, 0, 0)}
                            Size={new UDim2(0.4, 0, 1, 0)}
                            Text="[DISABLED]"
                            TextColor3={Color3.fromRGB(255, 100, 100)}
                            TextScaled={true}
                        >
                            <uistroke Thickness={1} />
                        </textlabel>
                    )}

                    <textbutton
                        AnchorPoint={new Vector2(1, 0.5)}
                        BackgroundColor3={Color3.fromRGB(200, 50, 50)}
                        BorderSizePixel={0}
                        Position={new UDim2(1, -10, 0.5, 0)}
                        Size={new UDim2(0, 40, 0, 30)}
                        Text="✕"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        FontFace={RobotoSlabBold}
                        Event={{ Activated: onClose }}
                    >
                        <uicorner CornerRadius={new UDim(0, 6)} />
                    </textbutton>
                </frame>

                {/* Tab Bar */}
                <frame
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                    BorderSizePixel={0}
                    Position={new UDim2(0, 0, 0, 50)}
                    Size={new UDim2(1, 0, 0, 40)}
                >
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />

                    {(["Browse", "MyListings", "CreateListing"] as TabType[]).map((tab, index) => (
                        <textbutton
                            key={`tab-${tab}`}
                            BackgroundColor3={activeTab === tab ? Color3.fromRGB(80, 80, 80) : Color3.fromRGB(60, 60, 60)}
                            BorderSizePixel={0}
                            LayoutOrder={index}
                            Size={new UDim2(0.33, 0, 1, 0)}
                            Text={tab === "MyListings" ? "My Listings" : tab === "CreateListing" ? "Create Listing" : tab}
                            TextColor3={activeTab === tab ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(200, 200, 200)}
                            TextScaled={true}
                            FontFace={RobotoSlab}
                            Event={{
                                Activated: () => setActiveTab(tab)
                            }}
                        />
                    ))}
                </frame>

                {/* Content Area */}
                <frame
                    BackgroundTransparency={1}
                    Position={new UDim2(0, 0, 0, 90)}
                    Size={new UDim2(1, 0, 1, -90)}
                >
                    {/* Browse Tab */}
                    {activeTab === "Browse" && (
                        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                SortOrder={Enum.SortOrder.LayoutOrder}
                            />

                            <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />

                            <scrollingframe
                                BackgroundTransparency={1}
                                Size={new UDim2(1, 0, 1, -80)}
                                ScrollBarThickness={8}
                                ScrollBarImageColor3={Color3.fromRGB(100, 100, 100)}
                                CanvasSize={new UDim2(0, 0, 0, filteredListings.size() * 130)}
                            >
                                <uilistlayout
                                    FillDirection={Enum.FillDirection.Vertical}
                                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                    Padding={new UDim(0, 5)}
                                />

                                {(() => {
                                    const listingEntries: [string, MarketplaceListing][] = [];
                                    for (const [uuid, listing] of filteredListings) {
                                        listingEntries.push([uuid, listing]);
                                    }
                                    return listingEntries.map(([uuid, listing]) => (
                                        <ListingCard
                                            key={`listing-${uuid}`}
                                            listing={listing}
                                            onBuy={handleBuyItem}
                                            onBid={handlePlaceBid}
                                        />
                                    ));
                                })()}

                                {filteredListings.size() === 0 && (
                                    <textlabel
                                        BackgroundTransparency={1}
                                        FontFace={RobotoSlab}
                                        Size={new UDim2(1, 0, 0, 100)}
                                        Text="No listings found"
                                        TextColor3={Color3.fromRGB(150, 150, 150)}
                                        TextScaled={true}
                                    >
                                        <uistroke Thickness={1} />
                                    </textlabel>
                                )}
                            </scrollingframe>
                        </frame>
                    )}

                    {/* My Listings Tab */}
                    {activeTab === "MyListings" && (
                        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                            <scrollingframe
                                BackgroundTransparency={1}
                                Size={new UDim2(1, 0, 1, 0)}
                                ScrollBarThickness={8}
                                ScrollBarImageColor3={Color3.fromRGB(100, 100, 100)}
                                CanvasSize={new UDim2(0, 0, 0, myListings.size() * 130)}
                            >
                                <uilistlayout
                                    FillDirection={Enum.FillDirection.Vertical}
                                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                    Padding={new UDim(0, 5)}
                                />

                                {(() => {
                                    const myListingEntries: [string, MarketplaceListing][] = [];
                                    for (const [uuid, listing] of myListings) {
                                        myListingEntries.push([uuid, listing]);
                                    }
                                    return myListingEntries.map(([uuid, listing]) => (
                                        <ListingCard
                                            key={`my-listing-${uuid}`}
                                            listing={listing}
                                            onCancel={handleCancelListing}
                                            isOwner={true}
                                        />
                                    ));
                                })()}

                                {myListings.size() === 0 && (
                                    <textlabel
                                        BackgroundTransparency={1}
                                        FontFace={RobotoSlab}
                                        Size={new UDim2(1, 0, 0, 100)}
                                        Text="You have no active listings"
                                        TextColor3={Color3.fromRGB(150, 150, 150)}
                                        TextScaled={true}
                                    >
                                        <uistroke Thickness={1} />
                                    </textlabel>
                                )}
                            </scrollingframe>
                        </frame>
                    )}

                    {/* Create Listing Tab */}
                    {activeTab === "CreateListing" && (
                        <CreateListingForm onSubmit={handleCreateListing} />
                    )}
                </frame>
            </frame>
        </screengui>
    );
}