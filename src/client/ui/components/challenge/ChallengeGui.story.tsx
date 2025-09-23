/**
 * @fileoverview UI Labs story for ChallengeGui component.
 * Provides interactive controls for testing challenge options and current challenge states.
 */

import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ChallengeGui, { CurrentChallengeInfo } from "./ChallengeGui";
import ChallengeHudDisplay from "./ChallengeHudDisplay";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            showChallenges: true,
            inChallenge: false,
            showHudDisplay: true,
        },
    },
    (props) => {
        const [challenges] = useState<Map<string, ChallengeInfo>>(
            new Map([
                [
                    "melting-economy-1",
                    {
                        name: "Melting Economy I",
                        description: "Funds gain is heavily nerfed by ^0.95.",
                        task: "Purchase Admiration or Codependence",
                        notice: "A Skillification will be simulated. Your progress is not lost.",
                        reward: "Boost: x$1 > x$2",
                        r1: 170,
                        g1: 255,
                        b1: 151,
                        r2: 0,
                        g2: 170,
                        b2: 255,
                    },
                ],
                [
                    "burning-bridges-2",
                    {
                        name: "Burning Bridges II",
                        description: "All droplets take 50% longer to process.",
                        task: "Purchase Melting Economy I",
                        notice: "Challenge mode activated. Progress is preserved.",
                        reward: "Boost: x$2 > x$3",
                        r1: 255,
                        g1: 151,
                        b1: 151,
                        r2: 255,
                        g2: 70,
                        b2: 70,
                    },
                ],
            ]),
        );

        const currentChallenge: CurrentChallengeInfo | undefined = props.controls.inChallenge
            ? {
                  name: challenges.get("melting-economy-1")!.name,
                  description: challenges.get("melting-economy-1")!.description,
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

        const displayChallenges = props.controls.showChallenges ? challenges : new Map<string, ChallengeInfo>();

        return (
            <StrictMode>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    {/* Challenge HUD Display */}
                    {props.controls.showHudDisplay && props.controls.inChallenge && (
                        <ChallengeHudDisplay
                            challengeName={currentChallenge!.name}
                            challengeDescription={currentChallenge!.description}
                            challengeColors={currentChallenge!.colors}
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
