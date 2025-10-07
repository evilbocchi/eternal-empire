import { OnoeNum } from "@rbxts/serikanum";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import RenameWindow from "client/components/rename/RenameWindow";
import StoryMocking from "client/components/StoryMocking";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            name: "Empire Test2",
            renameExponent: 36,
        },
    },
    (props) => {
        StoryMocking.mockData();

        useSingleDocumentVisibility("Rename", props.controls.visible);

        Packets.empireName.set(props.controls.name);
        Packets.renameCost.set(OnoeNum.fromSerika(1, props.controls.renameExponent));

        return <RenameWindow />;
    },
);
