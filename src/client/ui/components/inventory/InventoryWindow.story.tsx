import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import InventoryWindow from "client/ui/components/inventory/InventoryWindow";
import { SidebarManager } from "client/ui/components/sidebar/SidebarButtons";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";

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

        useEffect(() => {
            if (props.controls.visible) {
                SidebarManager.openWindow("Inventory");
            } else {
                SidebarManager.closeWindow("Inventory");
            }
        }, [props.controls.visible]);

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
