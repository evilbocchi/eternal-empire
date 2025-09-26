/**
 * @fileoverview UI Labs story for QuestCompletionNotification component.
 * Provides interactive controls for testing different quest completion scenarios.
 */

import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import QuestCompletionNotification, { QuestCompletionData } from "client/components/quest/QuestCompletionNotification";
import TheFirstConveyor from "shared/items/negative/tfd/TheFirstConveyor";
import CopperPickaxe from "shared/items/tools/CopperPickaxe";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            questName: "Learning the Basics",
            xpAmount: 150,
            showItemReward: true,
            showAreaReward: false,
        },
    },
    (props) => {
        const [questData, setQuestData] = useState<QuestCompletionData>({
            questName: props.controls.questName,
            questColor: Color3.fromRGB(175, 255, 194),
            reward: {},
            visible: false,
        });

        const triggerQuest = () => {
            const reward: {
                xp?: number;
                items?: Map<string, number>;
                area?:
                    | "ToxicWaterfall"
                    | "MagicalHideout"
                    | "SecretLab"
                    | "IntermittentIsles"
                    | "AbandonedRig"
                    | "DespairPlantation"
                    | "Eden"
                    | "BarrenIslands"
                    | "SlamoVillage"
                    | "SkyPavilion";
            } = {};

            // Always include XP
            reward.xp = props.controls.xpAmount;

            // Add item reward if enabled
            if (props.controls.showItemReward) {
                reward.items = new Map([
                    [CopperPickaxe.id, 5],
                    [TheFirstConveyor.id, 1],
                ]);
            }

            // Add area reward if enabled
            if (props.controls.showAreaReward) {
                reward.area = "SkyPavilion";
            }

            setQuestData({
                questName: props.controls.questName,
                questColor: Color3.fromRGB(175, 255, 194),
                reward: reward,
                visible: true,
            });
        };

        const handleComplete = () => {
            setQuestData((prev) => ({
                ...prev,
                visible: false,
            }));
        };

        return (
            <StrictMode>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    <QuestCompletionNotification data={questData} onComplete={handleComplete} />
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(100, 200, 100)}
                        Position={new UDim2(0, 50, 0, 50)}
                        Size={new UDim2(0, 200, 0, 50)}
                        Text="Trigger Quest Complete!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={18}
                        Event={{
                            Activated: triggerQuest,
                        }}
                    />
                    <textlabel
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 50, 0, 120)}
                        Size={new UDim2(0, 300, 0, 30)}
                        Text={`Quest: ${props.controls.questName}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={16}
                    />
                    <textlabel
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 50, 0, 150)}
                        Size={new UDim2(0, 300, 0, 30)}
                        Text={`XP Reward: ${props.controls.xpAmount}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={16}
                    />
                    <textlabel
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 50, 0, 180)}
                        Size={new UDim2(0, 300, 0, 30)}
                        Text={`Item Reward: ${props.controls.showItemReward ? "Yes" : "No"}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={16}
                    />
                    <textlabel
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 50, 0, 210)}
                        Size={new UDim2(0, 300, 0, 30)}
                        Text={`Area Unlock: ${props.controls.showAreaReward ? "Yes" : "No"}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={16}
                    />
                </frame>
            </StrictMode>
        );
    },
);
