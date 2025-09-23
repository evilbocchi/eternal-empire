/**
 * @fileoverview UI Labs story for ChallengeGui component.
 * Provides interactive controls for testing challenge options and current challenge states.
 */

import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ChallengeGui, { Challenge, CurrentChallengeInfo } from "./ChallengeGui";
import ChallengeHudDisplay from "./ChallengeHudDisplay";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            showChallenges: true,
            inChallenge: false,
            challengeName: "Melting Economy I",
            challengeDescription: "Funds gain is heavily nerfed",
            showHudDisplay: true,
        },
    },
    (props) => {
        const [challenges] = useState<Challenge[]>([
            {
                id: "melting-economy-1",
                name: "Melting Economy I",
                description: "Funds gain is heavily nerfed by ^0.95.",
                notice: "A Skillification will be simulated. Your progress is not lost.",
                requirement: "Requirement: Purchase Admiration or Codependence",
                reward: "Boost: x$1 > x$2",
                colors: {
                    primary: Color3.fromRGB(170, 255, 151),
                    secondary: Color3.fromRGB(0, 170, 255),
                },
                isUnlocked: false,
            },
            {
                id: "burning-bridges",
                name: "Burning Bridges II",
                description: "All droplets take 50% longer to process.",
                notice: "Challenge mode activated. Progress is preserved.",
                requirement: "Requirement: Complete Melting Economy I",
                reward: "Boost: x$2 > x$3",
                colors: {
                    primary: Color3.fromRGB(255, 151, 151),
                    secondary: Color3.fromRGB(255, 70, 70),
                },
                isUnlocked: true,
            },
        ]);

        const currentChallenge: CurrentChallengeInfo | undefined = props.controls.inChallenge
            ? {
                  name: props.controls.challengeName,
                  description: props.controls.challengeDescription,
                  colors: {
                      primary: Color3.fromRGB(170, 255, 151),
                      secondary: Color3.fromRGB(0, 170, 255),
                  },
              }
            : undefined;

        const handleStartChallenge = (challengeId: string) => {
            print(`Starting challenge: ${challengeId}`);
        };

        const handleQuitChallenge = () => {
            print("Quitting challenge");
        };

        const displayChallenges = props.controls.showChallenges ? challenges : [];

        return (
            <StrictMode>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    {/* Challenge HUD Display */}
                    {props.controls.showHudDisplay && props.controls.inChallenge && (
                        <ChallengeHudDisplay
                            challengeName={props.controls.challengeName}
                            challengeDescription={props.controls.challengeDescription}
                            challengeColors={{
                                primary: Color3.fromRGB(170, 255, 151),
                                secondary: Color3.fromRGB(0, 170, 255),
                            }}
                            visible={true}
                        />
                    )}

                    <ChallengeGui
                        challenges={displayChallenges}
                        currentChallenge={currentChallenge}
                        onStartChallenge={handleStartChallenge}
                        onQuitChallenge={handleQuitChallenge}
                    />

                    {/* Instructions */}
                    <textlabel
                        AnchorPoint={new Vector2(1, 0)}
                        BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                        BorderSizePixel={0}
                        Position={new UDim2(1, -10, 0, 10)}
                        Size={new UDim2(0, 300, 0, 140)}
                        Text={`Controls:
- Show Challenges: ${props.controls.showChallenges ? "Yes" : "No"}
- In Challenge: ${props.controls.inChallenge ? "Yes" : "No"}
- Show HUD Display: ${props.controls.showHudDisplay ? "Yes" : "No"}
- Challenge: ${props.controls.challengeName}
- Description: ${props.controls.challengeDescription}`}
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
