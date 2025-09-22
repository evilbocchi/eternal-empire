import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/ui/components/App";
import StoryMocking from "client/ui/components/StoryMocking";

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

        return <App viewportsEnabled={props.controls.viewportsEnabled} />;
    },
);
