/**
 * @fileoverview UI Labs story for ChallengeCompletionNotification component.
 * Provides interactive controls for testing epic challenge completion animations.
 */

import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "shared/constants";
import ChallengesBoard from "shared/items/bonuses/ChallengesBoard";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {},
    },
    (props) => {
        useEffect(() => {
            const model = ChallengesBoard.createModel({
                item: ChallengesBoard.id,
                posX: 0,
                posY: 50,
                posZ: -5,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
            });
            if (model) {
                model.Parent = Workspace;
                ChallengesBoard.clientLoad(model, LOCAL_PLAYER!);
            }
            return () => {
                model?.Destroy();
            };
        }, []);

        return <Fragment />;
    },
);
