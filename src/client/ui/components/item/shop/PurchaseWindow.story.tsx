import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, CreateReactStory } from "@rbxts/ui-labs";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/ui/hooks/useVisibility";
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
            viewportsEnabled: false,
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

        return (
            <StrictMode>
                <TooltipWindow />
                <PurchaseWindow item={item} viewportsEnabled={props.controls.viewportsEnabled} />
            </StrictMode>
        );
    },
);
