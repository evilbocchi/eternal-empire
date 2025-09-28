import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import MarketplaceWindow from "client/components/marketplace/MarketplaceWindow";
import StoryMocking from "client/components/StoryMocking";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";
import Packets from "shared/Packets";
import Items from "shared/items/Items";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        StoryMocking.mockData();

        const listingUuid = "example-item-uuid";
        const sampleItem = Items.getItem("BulkyDropperBooster");
        let listingUniqueItem: UniqueItemInstance | undefined;

        if (sampleItem !== undefined) {
            const uniqueTrait = sampleItem.findTrait("Unique");
            if (uniqueTrait !== undefined) {
                listingUniqueItem = uniqueTrait.generateInstance(0.75);
                listingUniqueItem.created = os.time();
            }
        }

        if (listingUniqueItem === undefined) {
            const fallbackPots = new Map<string, number>();
            fallbackPots.set("dropRateMultiplier", 75);
            listingUniqueItem = {
                baseItemId: sampleItem?.id ?? "BulkyDropperBooster",
                pots: fallbackPots,
                created: os.time(),
            };
        }

        const uniqueInstances = Packets.uniqueInstances.get() ?? new Map<string, UniqueItemInstance>();
        uniqueInstances.set(listingUuid, listingUniqueItem);
        Packets.uniqueInstances.set(uniqueInstances);

        Packets.marketplaceListings.set(
            new Map([
                [
                    "example-listing-id",
                    {
                        active: true,
                        uuid: listingUuid,
                        sellerId: 123456,
                        sellerEmpireId: "example-empire-id",
                        price: 1000,
                        listingType: "buyout",
                        created: os.time(),
                        expires: os.time() + 7 * 24 * 60 * 60, // Expires in one week
                        uniqueItem: listingUniqueItem,
                    },
                ],
            ]),
        );

        useSingleDocumentVisibility("Marketplace", props.controls.visible);

        return <MarketplaceWindow />;
    },
);
