import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/components/App";
import StoryMocking from "client/components/StoryMocking";
import SimulationCommandInterface from "client/components/story/SimulationCommandInterface";
import ProximityPromptTrigger from "client/components/story/ProximityPromptTrigger";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            viewportsEnabled: false,
        },
    },
    (props) => {
        StoryMocking.mockCharacter();

        useEffect(() => {
            StoryMocking.mockFlamework();
        }, []);

        return (
            <Fragment>
                <App viewportsEnabled={props.controls.viewportsEnabled} />
                <SimulationCommandInterface />
                <ProximityPromptTrigger />
            </Fragment>
        );
    },
);
