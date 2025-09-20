import { OnoeNum } from "@antivivi/serikanum";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import DarkMatterGui from "client/ui/components/world/DarkMatterGui";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            darkMatter: 100,
        },
    },
    (props) => {
        const balance = Packets.balance.get();
        balance.set("Dark Matter", new OnoeNum(props.controls.darkMatter));
        Packets.balance.set(balance);
        // NOTE: You need to switch to Viewport mode to see this story in the world
        return <DarkMatterGui />;
    },
);
