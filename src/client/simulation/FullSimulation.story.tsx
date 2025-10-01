import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/components/App";
import StoryMocking from "client/components/StoryMocking";
import ItemViewport from "client/components/item/ItemViewport";
import ProximityPromptTrigger from "client/components/story/ProximityPromptTrigger";
import SimulationCommandInterface from "client/components/story/SimulationCommandInterface";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        StoryMocking.mockPhysics();
        StoryMocking.mockCharacter();
        ItemViewport.disable();

        useEffect(() => {
            StoryMocking.mockFlamework();
        }, []);

        return (
            <Fragment>
                <App />
                <SimulationCommandInterface />
                <ProximityPromptTrigger />
            </Fragment>
        );
    },
);
