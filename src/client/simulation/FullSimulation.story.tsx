import "client/react-config";

import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/components/App";
import SimulationCommandInterface from "client/components/story/SimulationCommandInterface";
import StoryMocking from "client/components/StoryMocking";
import cleanupSimulation from "shared/hamster/cleanupSimulation";
import ItemViewport from "shared/item/ItemViewport";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        StoryMocking.mockPhysics();
        StoryMocking.mockCharacter();
        StoryMocking.mockFlamework();
        ItemViewport.disable();

        useEffect(() => {
            return cleanupSimulation();
        });

        return (
            <Fragment>
                <App />
                <SimulationCommandInterface />
            </Fragment>
        );
    },
);
