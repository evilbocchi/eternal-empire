/**
 * @fileoverview UI Labs story for ChallengeGui component.
 * Provides interactive controls for testing challenge options and current challenge states.
 */

import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ChallengeGui from "client/components/challenge/ChallengeGui";
import ChallengeHudWindow from "client/components/challenge/ChallengeHudWindow";
import { Challenge } from "shared/Challenge";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            showChallenges: true,
            currentChallenge: Challenge.MeltingEconomy.id,
            showHudDisplay: true,
        },
    },
    (props) => {
        Packets.currentChallenge.set(props.controls.currentChallenge);

        return (
            <StrictMode>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    {/* Challenge HUD Display */}
                    {props.controls.showHudDisplay && <ChallengeHudWindow />}

                    <ChallengeGui />

                    {/* Instructions */}
                    <textlabel
                        AnchorPoint={new Vector2(1, 0)}
                        BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                        BorderSizePixel={0}
                        Position={new UDim2(1, -10, 0, 10)}
                        Size={new UDim2(0, 300, 0, 140)}
                        Text={`Controls:
- Show Challenges: ${props.controls.showChallenges ? "Yes" : "No"}
- In Challenge: ${props.controls.currentChallenge}
- Show HUD Display: ${props.controls.showHudDisplay ? "Yes" : "No"}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        TextYAlignment={Enum.TextYAlignment.Top}
                        ZIndex={10}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uipadding
                            PaddingBottom={new UDim(0, 8)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                            PaddingTop={new UDim(0, 8)}
                        />
                    </textlabel>
                </frame>
            </StrictMode>
        );
    },
);
