import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import InventoryWindow from "client/components/item/inventory/InventoryWindow";
import useCIViewportManagement from "client/components/item/useCIViewportManagement";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            viewportsEnabled: false,
        },
    },
    (props) => {
        StoryMocking.mockData();

        useSingleDocumentVisibility("Inventory", props.controls.visible);
        const viewportManagement = useCIViewportManagement({ enabled: props.controls.viewportsEnabled });

        return (
            <StrictMode>
                <InventoryWindow viewportManagement={viewportManagement} />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
