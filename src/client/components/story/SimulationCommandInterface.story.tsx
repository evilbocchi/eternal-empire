import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import StoryMocking from "client/components/StoryMocking";
import SimulationCommandInterface from "client/components/story/SimulationCommandInterface";
import cleanupSimulation from "shared/hamster/cleanupSimulation";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {},
    },
    () => {
        StoryMocking.mockCharacter();
        StoryMocking.mockFlamework();

        useEffect(() => {
            return cleanupSimulation();
        });

        return <SimulationCommandInterface />;
    },
);
