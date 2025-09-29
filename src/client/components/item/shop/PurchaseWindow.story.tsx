import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, CreateReactStory } from "@rbxts/ui-labs";
import PurchaseWindow, { PurchaseManager } from "client/components/item/shop/PurchaseWindow";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";
import Items from "shared/items/Items";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import Packets from "shared/Packets";

const options = new Array<string>();
for (const item of Items.sortedItems) options.push(item.id);

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            broke: false,
            item: Choose(options),
        },
    },
    (props) => {
        StoryMocking.mockData();

        if (props.controls.broke) {
            Packets.balance.set(new Map());
            Packets.inventory.set(new Map());
        }

        useSingleDocumentVisibility("Purchase", props.controls.visible);

        const item = Items.getItem(props.controls.item) ?? TheFirstDropper;
        useEffect(() => {
            PurchaseManager.select(item);
        }, [item]);

        return (
            <StrictMode>
                <TooltipWindow />
                <PurchaseWindow />
            </StrictMode>
        );
    },
);
