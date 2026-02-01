import "client/react-config";

import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/components/App";
import SimulationCommandInterface from "client/components/story/SimulationCommandInterface";
import StoryMocking from "client/components/StoryMocking";
import manuallyIgniteFlamework from "shared/hamster/manuallyIgniteFlamework";
import ItemViewport from "shared/item/ItemViewport";

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
            const flameworkContext = manuallyIgniteFlamework();
            return () => {
                flameworkContext.cleanup();
                ItemViewport.cleanup();
            };
        }, []);

        return (
            <Fragment>
                <App />
                <SimulationCommandInterface />
            </Fragment>
        );
    },
);
