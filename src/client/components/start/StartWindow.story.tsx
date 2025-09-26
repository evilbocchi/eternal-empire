import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import SettingsWindow from "client/components/settings/SettingsWindow";
import StartWindow from "client/components/start/StartWindow";
import useVisibility from "client/hooks/useVisibility";
import MusicManager from "client/MusicManager";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            fastTransitions: false,
        },
    },
    (props) => {
        useVisibility("Start", props.controls.visible);

        Packets.availableEmpires.set(
            new Map([
                [
                    "Empire1",
                    {
                        name: "The First Empire",
                        owner: 1,
                        created: 500,
                        items: 55,
                        playtime: 2599,
                    },
                ],
                [
                    "Empire2",
                    {
                        name: "The Second Empire",
                        owner: 2,
                        created: 1500,
                        items: 150,
                        playtime: 3600,
                    },
                ],
            ]),
        );

        useEffect(() => {
            Workspace.SetAttribute("Start", true);
            const settings = table.clone(Packets.settings.get());
            settings.Music = true;
            Packets.settings.set(settings);
            return MusicManager.init();
        }, []);

        return (
            <Fragment>
                <StartWindow fastTransitions={props.controls.fastTransitions} />
                <SettingsWindow />
            </Fragment>
        );
    },
);
