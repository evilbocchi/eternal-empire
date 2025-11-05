import { simpleInterval } from "@antivivi/vrldk";
import React, { Fragment, JSX, useEffect, useState } from "@rbxts/react";
import { CollectionService } from "@rbxts/services";
import CreateListingForm from "client/components/marketplace/CreateListingForm";
import ListingCard from "client/components/marketplace/ListingCard";
import SearchFilters, { MarketplaceSortOption } from "client/components/marketplace/SearchFilters";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/components/window/TechWindow";
import useProperty from "client/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import "shared/marketplace/MarketplaceListing";
import Packets from "shared/Packets";

type TabType = "Browse" | "MyListings" | "CreateListing";

// Main Marketplace Window Component
export default function MarketplaceWindow() {
    const { id, visible, openDocument, closeDocument } = useSingleDocument({ id: "Marketplace", priority: 1 });
    const [activeTab, setActiveTab] = useState<TabType>("Browse");
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const myListings = useProperty(Packets.empireActiveListings);
    const [sort, setSort] = useState<MarketplaceSortOption>();

    // Track whether player was previously in range to control window open/close logic
    useEffect(() => {
        let wasInRange = false;
        const cleanup = simpleInterval(() => {
            const models = CollectionService.GetTagged("MarketplaceTerminal");
            let marketplacePosition: Vector3 | undefined;
            for (const model of models) {
                if (!model.IsA("Model")) continue;
                marketplacePosition = model.GetPivot().Position;
                break;
            }
            if (marketplacePosition === undefined) return;

            const characterPosition = getPlayerCharacter()?.GetPivot();
            if (characterPosition === undefined) return;

            const distance = marketplacePosition.sub(characterPosition.Position).Magnitude;
            const inRange = distance <= 15;

            if (inRange && !wasInRange) {
                openDocument();
            }
            if (!inRange && wasInRange) {
                closeDocument();
            }
            wasInRange = inRange;
        }, 0.5);

        return () => {
            cleanup();
        };
    }, []);

    // Load data when window becomes visible
    useEffect(() => {
        if (visible) {
            // Get current state
            const currentListings = Packets.searchListings.toServer("", 1);
            if (currentListings) setListings(currentListings);
        }
    }, [visible]);

    const handleBuyItem = (uuid: string) => {
        Packets.buyItem.toServer(uuid);
    };

    const handleCancelListing = (uuid: string) => {
        const success = Packets.cancelListing.toServer(uuid);
        if (success) {
            playSound("Success.mp3");
        } else {
            playSound("Error.mp3");
        }
    };

    const handleCreateListing = (uuid: string, price: number) => {
        return Packets.createListing.toServer(uuid, price);
    };

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

                        <SearchFilters
                            onSearch={(query) => setListings(Packets.searchListings.toServer(query, 1))}
                            onSort={(sort) => setSort(sort)}
                        />

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
                                return listings.map((listing) => (
                                    <ListingCard listing={listing} onBuy={handleBuyItem} />
                                ));
                            })()}

                            {listings.size() === 0 && (
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
                            const elements = new Array<JSX.Element>();
                            for (const [, listing] of myListings) {
                                elements.push(
                                    <ListingCard listing={listing} onCancel={handleCancelListing} isOwner={true} />,
                                );
                            }
                            return elements;
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
