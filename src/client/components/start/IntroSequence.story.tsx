import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { ReplicatedStorage } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/components/App";
import performIntroSequence from "client/components/start/performIntroSequence";
import StoryMocking from "client/components/StoryMocking";
import Packets from "shared/Packets";
/**
 * Story for previewing the intro sequence where the player wakes up
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        Packets.getLogs.toServer = () => [];
        ReplicatedStorage.SetAttribute("Intro", undefined);
        StoryMocking.mockCharacter(false);

        return (
            <Fragment>
                <textbutton
                    AnchorPoint={new Vector2(0.5, 0)}
                    Text={"Play Intro Sequence"}
                    Size={new UDim2(0, 300, 0, 50)}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    Event={{
                        MouseButton1Click: () => {
                            ReplicatedStorage.SetAttribute("Intro", true);
                            performIntroSequence();
                        },
                    }}
                />

                <App viewportsEnabled={false} />
            </Fragment>
        );
    },
);
