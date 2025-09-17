import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import InventoryWindow from "client/ui/components/item/inventory/InventoryWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/ui/hooks/useVisibility";

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

        // const buildController = new BuildController();
        // const inventoryController = new InventoryController(buildController);

        return (
            <StrictMode>
                {/* <InventoryWindow inventoryController={inventoryController} /> */}
                <InventoryWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
