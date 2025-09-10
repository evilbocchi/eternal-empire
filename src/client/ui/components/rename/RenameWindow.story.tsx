import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import RenameWindow from "client/ui/components/rename/RenameWindow";
import { SidebarManager } from "client/ui/components/sidebar/SidebarButtons";
import StoryMocking from "client/ui/components/StoryMocking";
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

        useEffect(() => {
            if (props.controls.visible) {
                SidebarManager.openWindow("Rename");
            } else {
                SidebarManager.closeWindow("Rename");
            }
        }, [props.controls.visible]);

        Packets.empireName.set(props.controls.name);
        Packets.renameCost.set(OnoeNum.fromSerika(1, props.controls.renameExponent));

        return <RenameWindow />;
    },
);
