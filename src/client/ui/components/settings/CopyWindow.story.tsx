import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import CopyWindow from "client/ui/components/settings/CopyWindow";
import SingleDocumentManager from "../sidebar/SingleDocumentManager";
import StoryMocking from "client/ui/components/StoryMocking";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            text: "old text",
        },
    },
    (props) => {
        StoryMocking.mockData();

        useEffect(() => {
            if (props.controls.visible) {
                SingleDocumentManager.openWindow("Copy");
            } else {
                SingleDocumentManager.closeWindow("Copy");
            }
        }, [props.controls.visible]);

        useEffect(() => {
            Packets.codeReceived.toAllClients(props.controls.text);
        }, [props.controls.text]);

        return <CopyWindow />;
    },
);
