import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BackpackWindow from "client/components/backpack/BackpackWindow";
import { HarvestableGuiRenderer } from "client/components/item/HarvestableGui";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import useVisibility from "client/hooks/useVisibility";
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
