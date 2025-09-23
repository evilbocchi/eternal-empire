import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "client/constants";
import SettingsWindow from "client/ui/components/settings/SettingsWindow";
import StartWindow from "client/ui/components/start/StartWindow";
import useVisibility from "client/ui/hooks/useVisibility";
import SoundManager from "client/ui/SoundManager";

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
            const cleanup = SoundManager.init();
            return cleanup;
        }, []);

        return (
            <Fragment>
                <StartWindow />
                <SettingsWindow />
            </Fragment>
        );
    },
);
