import { OnoeNum } from "@antivivi/serikanum";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import FundsBombsBoardGui from "client/ui/components/world/FundsBombsBoardGui";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            fundsBombs: 100,
        },
    },
    (props) => {
        const balance = Packets.balance.get();
        balance.set("Funds Bombs", new OnoeNum(props.controls.fundsBombs));
        Packets.balance.set(balance);
        // NOTE: You need to switch to Viewport mode to see this story in the world
        return <FundsBombsBoardGui />;
    },
);
