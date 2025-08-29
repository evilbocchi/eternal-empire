/**
 * @fileoverview Individual leaderboard slot component displaying a single entry.
 */

import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { RobotoMono } from "shared/ui/GameFonts";

/** Props for individual leaderboard slots */
export interface LeaderboardSlotProps {
    /** The leaderboard entry data */
    entry: LeaderboardEntry;
    /** Whether this slot is highlighted */
    isHighlighted?: boolean;
    /** Whether to play the scrolling gradient animation */
    playAnimation?: boolean;
}

/**
 * A single leaderboard entry displaying place, name, and amount.
 */
export default function LeaderboardSlot({ entry, isHighlighted = false, playAnimation = true }: LeaderboardSlotProps) {
    // Animation state for top 3 places gradients
    const [gradientOffset, setGradientOffset] = useState(0);

    // Animate gradient movement for top 3 places
    useEffect(() => {
        if (entry.place > 3) return;

        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            setGradientOffset((prev) => {
                if (prev >= 1) {
                    prev = -1;
                    t = 0;
                    return prev;
                }
                t += dt;
                if (t < 1.5) {
                    return prev;
                }
                // Different animation speeds for each place
                const speed = entry.place === 1 ? 0.004 : entry.place === 2 ? 0.003 : 0.002;
                return prev + speed;
            });
        });

        return () => connection.Disconnect();
    }, [entry.place, playAnimation]);

    // Special styling for top 3 places
    let backgroundColor: Color3;
    let textColor: Color3;
    let strokeColor: Color3;
    let strokeTransparency: number;

    if (entry.place > 3) {
        // Default styling for other places
        backgroundColor = isHighlighted
            ? Color3.fromRGB(255, 255, 170)
            : Color3.fromRGB(255, 255, 255);
        textColor = Color3.fromRGB(0, 0, 0);
        strokeColor = Color3.fromRGB(255, 255, 255);
        strokeTransparency = 0.9;
    }
    else {
        switch (entry.place) {
            case 1:
                backgroundColor = Color3.fromRGB(255, 215, 0);
                break;
            case 2:
                backgroundColor = Color3.fromRGB(192, 192, 192);
                break;
            case 3:
                backgroundColor = Color3.fromRGB(205, 127, 50);
                break;
            default:
                backgroundColor = Color3.fromRGB(255, 255, 255);
        }
        textColor = backgroundColor.Lerp(new Color3(0, 0, 0), 0.7);
        strokeColor = backgroundColor.Lerp(Color3.fromRGB(255, 255, 255), 0.4);
        strokeTransparency = 0.3;
    }

    // Special height for 
    const slotHeight = entry.place === 1 ? 70 : 45;

    return (
        <frame
            key="LeaderboardSlot"
            BackgroundColor3={backgroundColor}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, slotHeight)}
            LayoutOrder={entry.place}
        >
            {/* Add a subtle glow effect for top 3 places */}
            {entry.place <= 3 && (
                <uistroke
                    Color={entry.place === 1 ? Color3.fromRGB(255, 215, 0) :
                        entry.place === 2 ? Color3.fromRGB(192, 192, 192) :
                            Color3.fromRGB(205, 127, 50)}
                    Thickness={2}
                    Transparency={0.3}
                />
            )}

            {/* Animated gradient for 1st place */}
            {entry.place === 1 && (
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 215, 0)),    // Gold
                        new ColorSequenceKeypoint(0.3, Color3.fromRGB(255, 255, 0)),  // Bright Yellow
                        new ColorSequenceKeypoint(0.6, Color3.fromRGB(255, 140, 0)),  // Orange
                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 215, 0))     // Gold
                    ])}
                    Offset={new Vector2(gradientOffset, 0)}
                />
            )}

            {/* Animated gradient for 2nd place */}
            {entry.place === 2 && (
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(192, 192, 192)),  // Silver
                        new ColorSequenceKeypoint(0.3, Color3.fromRGB(220, 220, 220)), // Bright Silver
                        new ColorSequenceKeypoint(0.6, Color3.fromRGB(169, 169, 169)), // Dark Silver
                        new ColorSequenceKeypoint(1, Color3.fromRGB(192, 192, 192))   // Silver
                    ])}
                    Offset={new Vector2(gradientOffset, 0)}
                />
            )}

            {/* Animated gradient for 3rd place */}
            {entry.place === 3 && (
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(205, 127, 50)),   // Bronze
                        new ColorSequenceKeypoint(0.3, Color3.fromRGB(255, 165, 79)), // Bright Bronze
                        new ColorSequenceKeypoint(0.6, Color3.fromRGB(184, 115, 51)), // Dark Bronze
                        new ColorSequenceKeypoint(1, Color3.fromRGB(205, 127, 50))    // Bronze
                    ])}
                    Offset={new Vector2(gradientOffset, 0)}
                />
            )}
            <textlabel
                key="PlaceLabel"
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Size={new UDim2(0.125, 0, 1, 0)}
                Text={tostring(entry.place)}
                TextColor3={textColor}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={strokeColor}
                TextStrokeTransparency={strokeTransparency}
                TextWrapped={true}
            />
            <textlabel
                key="ServerLabel"
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Position={new UDim2(0.15, 0, 0, 0)}
                Size={new UDim2(0.65, 0, 1, 0)}
                Text={entry.name}
                TextColor3={textColor}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={strokeColor}
                TextStrokeTransparency={strokeTransparency}
                TextWrapped={true}
            />
            <textlabel
                key="AmountLabel"
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Position={new UDim2(0.85, 0, 0, 0)}
                Size={new UDim2(0.15, 0, 1, 0)}
                Text={OnoeNum.fromSingle(entry.amount).toString()}
                TextColor3={textColor}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={strokeColor}
                TextStrokeTransparency={strokeTransparency}
                TextWrapped={true}
            />
            <uicorner CornerRadius={new UDim(0, 9)} />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} PaddingTop={new UDim(0, 3)} PaddingBottom={new UDim(0, 3)} />
        </frame>
    );
}
