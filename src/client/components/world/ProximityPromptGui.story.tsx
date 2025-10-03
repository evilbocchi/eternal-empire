import React, { Fragment, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import ProximityPromptGui from "client/components/world/ProximityPromptGui";
import CustomProximityPrompt from "shared/world/CustomProximityPrompt";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            fundsBombs: 100,
        },
    },
    (props) => {
        const [prompt, setPrompt] = useState<ProximityPrompt>();

        useEffect(() => {
            const part = new Instance("Part");
            part.Anchored = true;
            part.Position = new Vector3(0, 5, 0);
            part.Size = new Vector3(4, 1, 4);
            part.Parent = Workspace;

            const proximityPrompt = new Instance("ProximityPrompt");
            proximityPrompt.ActionText = "Test Action";
            proximityPrompt.ClickablePrompt = true;
            proximityPrompt.ObjectText = "Test Object";
            proximityPrompt.KeyboardKeyCode = Enum.KeyCode.E;
            proximityPrompt.HoldDuration = 0.5;
            proximityPrompt.Parent = part;
            const cleanup = CustomProximityPrompt.onTrigger(proximityPrompt, () => {
                print("Proximity prompt triggered!");
            });
            setPrompt(proximityPrompt);

            return () => {
                cleanup();
                proximityPrompt.Destroy();
                part.Destroy();
            };
        }, []);

        if (prompt === undefined) return <Fragment />;

        // NOTE: You need to switch to Viewport mode to see this story in the world
        return <ProximityPromptGui prompt={prompt} inputType={Enum.ProximityPromptInputType.Keyboard} />;
    },
);
