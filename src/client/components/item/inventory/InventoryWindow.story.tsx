import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import InventoryWindow from "client/components/item/inventory/InventoryWindow";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";

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

        useSingleDocumentVisibility("Inventory", props.controls.visible);

        return (
            <StrictMode>
                <InventoryWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
