import React, { StrictMode, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import NPCNotification from "client/components/npc/NPCNotification";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        const [proximityPrompt] = useState(new Instance("ProximityPrompt"));

        useEffect(() => {
            proximityPrompt.Enabled = props.controls.visible;
        }, [props.controls.visible]);

        return (
            <StrictMode>
                <NPCNotification prompt={proximityPrompt} />
            </StrictMode>
        );
    },
);
