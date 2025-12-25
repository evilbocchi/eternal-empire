/**
 * @fileoverview UI Labs story for ChallengeCompletionNotification component.
 * Provides interactive controls for testing epic challenge completion animations.
 */

import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory, Number } from "@rbxts/ui-labs";
import { CHALLENGE_PER_ID } from "shared/Challenge";
import { LOCAL_PLAYER } from "shared/constants";
import ChallengesBoard from "shared/items/bonuses/ChallengesBoard";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            empireLevel: Number(1, 0, 100, 1),
            currentChallengeLevel: Number(0, 0, 10, 1),
        },
    },
    (props) => {
        Packets.level.set(props.controls.empireLevel);

        const levelPerChallenge = new Map<string, number>();
        for (const [challengeId] of CHALLENGE_PER_ID) {
            levelPerChallenge.set(challengeId, props.controls.currentChallengeLevel);
        }
        Packets.currentLevelPerChallenge.set(levelPerChallenge);

        Packets.startChallenge.fromClient((_, challengeId) => {
            return (
                CHALLENGE_PER_ID.get(challengeId)!.requiredEmpireLevel(props.controls.currentChallengeLevel + 1) <=
                props.controls.empireLevel
            );
        });

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
