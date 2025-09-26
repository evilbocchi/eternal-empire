/**
 * @fileoverview Storybook for testing the Level Up notification component.
 */

import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import LevelUpNotification, { LevelUpData } from "client/components/levelup/LevelUpNotification";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            level: 5,
        },
    },
    (props) => {
        const [levelUpData, setLevelUpData] = useState<LevelUpData>({
            level: props.controls.level,
            visible: false,
        });

        const triggerLevelUp = () => {
            setLevelUpData({
                level: props.controls.level,
                visible: true,
            });
        };

        const handleComplete = () => {
            setLevelUpData((prev) => ({
                ...prev,
                visible: false,
            }));
        };

        return (
            <StrictMode>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    <LevelUpNotification data={levelUpData} onComplete={handleComplete} />
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(100, 200, 100)}
                        Position={new UDim2(0, 50, 0, 50)}
                        Size={new UDim2(0, 200, 0, 50)}
                        Text="Trigger Level Up!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={18}
                        Event={{
                            Activated: triggerLevelUp,
                        }}
                    />
                    <textlabel
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 50, 0, 120)}
                        Size={new UDim2(0, 300, 0, 30)}
                        Text={`Level: ${props.controls.level}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={16}
                    />
                </frame>
            </StrictMode>
        );
    },
);
