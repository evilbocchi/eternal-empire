import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/ui/components/App";
import StoryMocking from "client/ui/components/StoryMocking";
import { useVisibilityMain } from "client/ui/hooks/useVisibility";
import SoundManager from "client/ui/SoundManager";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        StoryMocking.mockCharacter();

        useEffect(() => {
            StoryMocking.mockFlamework();

            const cleanup = SoundManager.init();
            return () => {
                cleanup();
            };
        }, []);

        useVisibilityMain(true);

        return <App viewportsEnabled={true} />;
    },
);
