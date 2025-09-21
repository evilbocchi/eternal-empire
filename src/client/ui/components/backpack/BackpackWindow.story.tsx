import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import { HarvestableGuiRenderer } from "client/ui/components/item/HarvestableGui";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import useVisibility from "client/ui/hooks/useVisibility";
import Packets from "shared/Packets";

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
        StoryMocking.mockCharacter();
        useVisibility("Backpack", props.controls.visible);

        Packets.useTool.fromClient((harvestable) => {
            harvestable.SetAttribute("Health", math.random(5, 15));
        });

        return (
            <StrictMode>
                <BackpackWindow />
                <HarvestableGuiRenderer />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
