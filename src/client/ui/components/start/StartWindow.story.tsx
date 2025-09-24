import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "client/constants";
import SettingsWindow from "client/ui/components/settings/SettingsWindow";
import StartWindow from "client/ui/components/start/StartWindow";
import useVisibility from "client/ui/hooks/useVisibility";
import SoundManager from "client/ui/SoundManager";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useVisibility("Start", props.controls.visible);

        useEffect(() => {
            LOCAL_PLAYER.SetAttribute("Start", true);
            const settings = table.clone(Packets.settings.get());
            settings.Music = true;
            Packets.settings.set(settings);
            return SoundManager.init();
        }, []);

        return (
            <Fragment>
                <StartWindow />
                <SettingsWindow />
            </Fragment>
        );
    },
);
