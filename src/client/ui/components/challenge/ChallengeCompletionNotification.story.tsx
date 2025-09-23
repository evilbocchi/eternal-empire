/**
 * @fileoverview UI Labs story for ChallengeCompletionNotification component.
 * Provides interactive controls for testing epic challenge completion animations.
 */

import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ChallengeCompletionNotification, { ChallengeCompletionData } from "./ChallengeCompletionNotification";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            challengeName: "Melting Economy I",
            rewardText: "Boost: x$1 > x$2",
            primaryColorR: 255,
            primaryColorG: 215,
            primaryColorB: 0,
            secondaryColorR: 255,
            secondaryColorG: 140,
            secondaryColorB: 0,
        },
    },
    (props) => {
        const [notificationData, setNotificationData] = useState<ChallengeCompletionData>({
            challengeName: props.controls.challengeName,
            rewardText: props.controls.rewardText,
            challengeColors: {
                primary: Color3.fromRGB(
                    props.controls.primaryColorR,
                    props.controls.primaryColorG,
                    props.controls.primaryColorB,
                ),
                secondary: Color3.fromRGB(
                    props.controls.secondaryColorR,
                    props.controls.secondaryColorG,
                    props.controls.secondaryColorB,
                ),
            },
            visible: false,
        });

        // Trigger challenge completion manually with button
        const triggerChallengeCompletion = () => {
            setNotificationData({
                challengeName: props.controls.challengeName,
                rewardText: props.controls.rewardText,
                challengeColors: {
                    primary: Color3.fromRGB(
                        props.controls.primaryColorR,
                        props.controls.primaryColorG,
                        props.controls.primaryColorB,
                    ),
                    secondary: Color3.fromRGB(
                        props.controls.secondaryColorR,
                        props.controls.secondaryColorG,
                        props.controls.secondaryColorB,
                    ),
                },
                visible: true,
            });
        };

        const handleComplete = () => {
            setNotificationData((prev) => ({ ...prev, visible: false }));
            print("Challenge completion notification finished!");
        };

        return (
            <StrictMode>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    {/* Background for context */}
                    <frame
                        BackgroundColor3={Color3.fromRGB(30, 30, 40)}
                        BorderSizePixel={0}
                        Size={new UDim2(1, 0, 1, 0)}
                    >
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(50, 50, 60)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(20, 20, 30)),
                                ])
                            }
                            Rotation={45}
                        />
                    </frame>

                    <ChallengeCompletionNotification data={notificationData} onComplete={handleComplete} />

                    {/* Trigger Button */}
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(255, 140, 0)}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 50, 0, 50)}
                        Size={new UDim2(0, 250, 0, 60)}
                        Text="🏆 TRIGGER CHALLENGE COMPLETE!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        ZIndex={5}
                        Event={{
                            Activated: triggerChallengeCompletion,
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uistroke Color={Color3.fromRGB(255, 215, 0)} Thickness={2} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 180, 50)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 120, 0)),
                                ])
                            }
                            Rotation={45}
                        />
                    </textbutton>

                    {/* Control Info Display */}
                    <frame
                        BackgroundColor3={Color3.fromRGB(40, 40, 50)}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 50, 0, 130)}
                        Size={new UDim2(0, 300, 0, 150)}
                        ZIndex={5}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 5)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Challenge: ${props.controls.challengeName}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 30)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Reward: ${props.controls.rewardText}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 55)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Primary: RGB(${props.controls.primaryColorR}, ${props.controls.primaryColorG}, ${props.controls.primaryColorB})`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 80)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Secondary: RGB(${props.controls.secondaryColorR}, ${props.controls.secondaryColorG}, ${props.controls.secondaryColorB})`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 110)}
                            Size={new UDim2(1, -20, 0, 35)}
                            Text="Click the button to trigger the epic challenge completion animation!"
                            TextColor3={Color3.fromRGB(200, 200, 200)}
                            TextSize={12}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                    </frame>

                    {/* Instructions */}
                    <textlabel
                        AnchorPoint={new Vector2(1, 0)}
                        BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                        BorderSizePixel={0}
                        Position={new UDim2(1, -10, 0, 10)}
                        Size={new UDim2(0, 350, 0, 180)}
                        Text={`Challenge Completion Demo:

• Challenge: ${props.controls.challengeName}
• Reward: ${props.controls.rewardText}
• Primary Color: RGB(${props.controls.primaryColorR}, ${props.controls.primaryColorG}, ${props.controls.primaryColorB})
• Secondary Color: RGB(${props.controls.secondaryColorR}, ${props.controls.secondaryColorG}, ${props.controls.secondaryColorB})

Click the "TRIGGER CHALLENGE COMPLETE!" button to start the epic animation sequence!

Adjust the controls to customize the challenge name, reward text, and colors, then trigger the animation to see your changes.`}
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

                    {/* Sample challenge items for visual context */}
                    <frame
                        AnchorPoint={new Vector2(0, 1)}
                        BackgroundColor3={Color3.fromRGB(60, 60, 70)}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 10, 1, -10)}
                        Size={new UDim2(0, 200, 0, 100)}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <textlabel
                            BackgroundTransparency={1}
                            FontSize={Enum.FontSize.Size18}
                            Size={new UDim2(1, 0, 1, 0)}
                            Text="🏆 Challenge System Demo
Epic completion animations with particles, sound effects, and gradient colors!"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextWrapped={true}
                            TextYAlignment={Enum.TextYAlignment.Center}
                        >
                            <uipadding
                                PaddingBottom={new UDim(0, 8)}
                                PaddingLeft={new UDim(0, 8)}
                                PaddingRight={new UDim(0, 8)}
                                PaddingTop={new UDim(0, 8)}
                            />
                        </textlabel>
                    </frame>
                </frame>
            </StrictMode>
        );
    },
);
