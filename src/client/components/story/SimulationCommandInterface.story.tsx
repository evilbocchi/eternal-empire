import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import StoryMocking from "client/components/StoryMocking";
import SimulationCommandInterface from "client/components/story/SimulationCommandInterface";
import manuallyIgniteFlamework from "shared/hamster/manuallyIgniteFlamework";
import ItemViewport from "shared/item/ItemViewport";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {},
    },
    () => {
        StoryMocking.mockCharacter();
        useEffect(() => {
            const flameworkContext = manuallyIgniteFlamework();
            return () => {
                flameworkContext.cleanup();
                ItemViewport.cleanup();
            };
        }, []);

        return <SimulationCommandInterface />;
    },
);
