import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import CreateListingForm from "client/components/marketplace/CreateListingForm";
import ListingCard from "client/components/marketplace/ListingCard";
import SearchFilters from "client/components/marketplace/SearchFilters";
import { useDocument } from "client/components/window/DocumentManager";
import TechWindow from "client/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import Items from "shared/items/Items";
import "shared/marketplace/MarketplaceListing";
import Packets from "shared/Packets";

type TabType = "Browse" | "MyListings" | "CreateListing";

// Main Marketplace Window Component
export default function MarketplaceWindow() {
    const { id, visible, setVisible } = useDocument({ id: "Marketplace", priority: 1 });
    const [activeTab, setActiveTab] = useState<TabType>("Browse");
    const [listings, setListings] = useState<Map<string, MarketplaceListing>>(new Map());
    const [myListings, setMyListings] = useState<Map<string, MarketplaceListing>>(new Map());
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<MarketplaceFilters>({});

    // Register with window manager

    // Load data when window becomes visible
    useEffect(() => {
        if (visible) {
            // Get current state
            const currentListings = Packets.marketplaceListings.get();
            const currentMyListings = Packets.myActiveListings.get();

            if (currentListings) setListings(currentListings);
            if (currentMyListings) setMyListings(currentMyListings);
        }
    }, [visible]);

    // Set up packet listeners
    useEffect(() => {
        const connections: RBXScriptConnection[] = [];

        connections.push(
            Packets.marketplaceListings.observe((newListings) => {
                setListings(newListings);
            }),
        );

        connections.push(
            Packets.myActiveListings.observe((newMyListings) => {
                setMyListings(newMyListings);
            }),
        );

        return () => {
            connections.forEach((conn) => conn.Disconnect());
        };
    }, []);

    const handleBuyItem = (uuid: string) => {
        Packets.buyItem.toServer(uuid);
    };

    const handlePlaceBid = (uuid: string, bidAmount: number) => {
        Packets.placeBid.toServer(uuid, bidAmount);
    };

    const handleCancelListing = (uuid: string) => {
        Packets.cancelListing.toServer(uuid);
    };

    const handleCreateListing = (uuid: string, price: number, listingType: "buyout" | "auction", duration: number) => {
        Packets.createListing.toServer(uuid, price, listingType, duration);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Trigger search logic here
    };

    const handleFilter = (newFilters: MarketplaceFilters) => {
        setFilters(newFilters);
        // Trigger filter logic here
    };

    const filteredListings = useMemo(() => {
        let result = new Map<string, MarketplaceListing>();

        // Copy all listings first
        for (const [uuid, listing] of listings) {
            result.set(uuid, listing);
        }

        // Apply search filter
        if (searchQuery !== "") {
            const filtered = new Map<string, MarketplaceListing>();
            const lowerQuery = searchQuery.lower();
            for (const [uuid, listing] of result) {
                let matches = string.find(uuid.lower(), lowerQuery)[0] !== undefined;

                if (!matches && listing.uniqueItem !== undefined) {
                    const uniqueItemInstance = listing.uniqueItem;
                    if (string.find(uniqueItemInstance.baseItemId.lower(), lowerQuery)[0] !== undefined) {
                        matches = true;
                    } else {
                        const item = Items.getItem(uniqueItemInstance.baseItemId);
                        if (item !== undefined) {
                            if (string.find(item.name.lower(), lowerQuery)[0] !== undefined) {
                                matches = true;
                            } else {
                                const uniqueTrait = item.findTrait("Unique");
                                if (uniqueTrait !== undefined) {
                                    for (const [potName] of uniqueTrait.getPotConfigs()) {
                                        if (string.find(potName.lower(), lowerQuery)[0] !== undefined) {
                                            matches = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (matches) {
                    filtered.set(uuid, listing);
                }
            }
            result = filtered;
        }

        // Apply filters
        let appliedFilters = false;
        for (const [key, value] of pairs(filters)) {
            if (value === undefined || value === "") continue;
            appliedFilters = true;
            break;
        }

        if (filters && appliedFilters) {
            const filtered = new Map<string, MarketplaceListing>();
            for (const [uuid, listing] of result) {
                let matches = true;
                for (const [key, value] of pairs(filters)) {
                    if (value === undefined || value === "") continue;
                    if (key === "baseItemId" && listing.uniqueItem) {
                        const item = Items.getItem(listing.uniqueItem.baseItemId);
                        // Cast value to keyof ItemTraits for Map lookup
                        if (!item || (item.types && !item.types.has(value as keyof ItemTraits))) {
                            matches = false;
                            break;
                        }
                    }

                    if (key === "minPrice" && listing.price !== undefined) {
                        const min = tonumber(value);
                        if (min !== undefined && listing.price < min) {
                            matches = false;
                            break;
                        }
                    }
                    if (key === "maxPrice" && listing.price !== undefined) {
                        const max = tonumber(value);
                        if (max !== undefined && listing.price > max) {
                            matches = false;
                            break;
                        }
                    }
                    // Add more filter logic as needed
                }
                if (matches) {
                    filtered.set(uuid, listing);
                }
            }
            result = filtered;
        }

        return result;
    }, [listings, searchQuery, filters]);

    const tabLabels: Record<TabType, string> = {
        Browse: "Browse",
        MyListings: "My Listings",
        CreateListing: "Create Listing",
    };

    return (
        <TechWindow title="Marketplace" icon={getAsset("assets/Purchase.png")} id={id} visible={visible}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                SortOrder={Enum.SortOrder.LayoutOrder}
                Padding={new UDim(0, 18)}
            />

            {/* Tab Bar */}
            <frame BackgroundTransparency={1} LayoutOrder={0} Size={new UDim2(1, 0, 0, 30)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                    Padding={new UDim(0.02, 0)}
                />

                {(["Browse", "MyListings", "CreateListing"] as TabType[]).map((tab) => {
                    const isActive = tab === activeTab;
                    return (
                        <textbutton
                            BackgroundColor3={isActive ? Color3.fromRGB(35, 98, 189) : Color3.fromRGB(24, 32, 48)}
                            BackgroundTransparency={isActive ? 0 : 0.2}
                            BorderColor3={new Color3(1, 1, 1)}
                            BorderSizePixel={2}
                            Size={new UDim2(0.32, 0, 1, 0)}
                            Text={tabLabels[tab]}
                            TextColor3={isActive ? Color3.fromRGB(226, 238, 255) : Color3.fromRGB(155, 178, 216)}
                            TextScaled={true}
                            FontFace={isActive ? RobotoMonoBold : RobotoMono}
                            Event={{
                                Activated: () => {
                                    playSound("MenuClick.mp3");
                                    setActiveTab(tab);
                                },
                                MouseEnter: () => {
                                    playSound("EmphasisButtonHover.mp3", undefined, (sound) => {
                                        sound.Volume = 0.2;
                                        sound.PlaybackSpeed = 2;
                                    });
                                },
                            }}
                        >
                            <uipadding
                                PaddingTop={new UDim(0, 4)}
                                PaddingBottom={new UDim(0, 4)}
                                PaddingLeft={new UDim(0, 8)}
                                PaddingRight={new UDim(0, 8)}
                            />
                            <uistroke
                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                Thickness={1}
                                Color={Color3.fromRGB(26, 26, 28)}
                            />
                            {isActive ? (
                                <uigradient
                                    Color={
                                        new ColorSequence([
                                            new ColorSequenceKeypoint(0, Color3.fromRGB(111, 182, 255)),
                                            new ColorSequenceKeypoint(1, Color3.fromRGB(52, 142, 255)),
                                        ])
                                    }
                                />
                            ) : undefined}
                        </textbutton>
                    );
                })}
            </frame>

            {/* Content Area */}
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, -48)} ZIndex={2}>
                {/* Browse Tab */}
                {activeTab === "Browse" ? (
                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 20)}
                        />

                        <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />

                        <scrollingframe
                            BackgroundTransparency={1}
                            AutomaticCanvasSize={Enum.AutomaticSize.Y}
                            CanvasSize={new UDim2(0, 0, 0, 0)}
                            ScrollBarThickness={6}
                            ScrollBarImageColor3={Color3.fromRGB(74, 140, 255)}
                            Size={new UDim2(1, 0, 1, -120)}
                        >
                            <uipadding
                                PaddingTop={new UDim(0, 6)}
                                PaddingBottom={new UDim(0, 6)}
                                PaddingLeft={new UDim(0, 2)}
                                PaddingRight={new UDim(0, 2)}
                            />
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                Padding={new UDim(0, 14)}
                            />

                            {(() => {
                                const listingEntries: [string, MarketplaceListing][] = [];
                                for (const [uuid, listing] of filteredListings) {
                                    listingEntries.push([uuid, listing]);
                                }
                                return listingEntries.map(([, listing]) => (
                                    <ListingCard listing={listing} onBuy={handleBuyItem} onBid={handlePlaceBid} />
                                ));
                            })()}

                            {filteredListings.size() === 0 && (
                                <textlabel
                                    BackgroundTransparency={1}
                                    FontFace={RobotoMono}
                                    Size={new UDim2(1, 0, 0, 20)}
                                    Text="No listings found."
                                    TextColor3={Color3.fromRGB(118, 138, 170)}
                                    TextScaled={true}
                                >
                                    <uistroke Thickness={1} Color={Color3.fromRGB(47, 64, 96)} Transparency={0.3} />
                                </textlabel>
                            )}
                        </scrollingframe>
                    </frame>
                ) : (
                    <Fragment />
                )}

                {/* My Listings Tab */}
                {activeTab === "MyListings" ? (
                    <scrollingframe
                        BackgroundTransparency={1}
                        AutomaticCanvasSize={Enum.AutomaticSize.Y}
                        CanvasSize={new UDim2(0, 0, 0, 0)}
                        ScrollBarThickness={6}
                        ScrollBarImageColor3={Color3.fromRGB(74, 140, 255)}
                        Size={new UDim2(1, 0, 1, 0)}
                    >
                        <uipadding
                            PaddingTop={new UDim(0, 6)}
                            PaddingBottom={new UDim(0, 6)}
                            PaddingLeft={new UDim(0, 2)}
                            PaddingRight={new UDim(0, 2)}
                        />
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 14)}
                        />

                        {(() => {
                            const myListingEntries: [string, MarketplaceListing][] = [];
                            for (const [uuid, listing] of myListings) {
                                myListingEntries.push([uuid, listing]);
                            }
                            return myListingEntries.map(([, listing]) => (
                                <ListingCard listing={listing} onCancel={handleCancelListing} isOwner={true} />
                            ));
                        })()}

                        {myListings.size() === 0 && (
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMono}
                                Size={new UDim2(1, 0, 0, 20)}
                                Text="You have no active listings."
                                TextColor3={Color3.fromRGB(118, 138, 170)}
                                TextScaled={true}
                            >
                                <uistroke Thickness={1} Color={Color3.fromRGB(47, 64, 96)} Transparency={0.3} />
                            </textlabel>
                        )}
                    </scrollingframe>
                ) : (
                    <Fragment />
                )}

                {/* Create Listing Tab */}
                {activeTab === "CreateListing" ? <CreateListingForm onSubmit={handleCreateListing} /> : <Fragment />}
            </frame>
        </TechWindow>
    );
}
