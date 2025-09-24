import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import StoryMocking from "client/ui/components/StoryMocking";
import SimulationCommandInterface from "client/ui/components/story/SimulationCommandInterface";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {},
    },
    (props) => {
        StoryMocking.mockCharacter();

        useEffect(() => {
            StoryMocking.mockFlamework();
        }, []);

        return <SimulationCommandInterface />;
    },
);
