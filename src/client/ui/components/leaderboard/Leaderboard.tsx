/**
 * @fileoverview Main leaderboard component that displays rankings.
 */

import React, { useState } from "@rbxts/react";
import LeaderboardHeader, { ColumnHeader } from "client/ui/components/leaderboard/LeaderboardHeader";
import LeaderboardSlot from "client/ui/components/leaderboard/LeaderboardSlot";

declare global {
    /** A single entry in the leaderboard */
    export interface LeaderboardEntry {
        /** The player's position on the leaderboard */
        place: number;
        /** The player's name or empire name */
        name: string;
        /** The value being ranked (currency, time, etc.) */
        amount: number;
    }

    export type LeaderboardType = Currency | "TimePlayed" | "Donated" | "Level";
}

/** Props for the main Leaderboard component */
export interface LeaderboardProps {
    /** The type/title of the leaderboard */
    leaderboardType: LeaderboardType;
    /** Array of leaderboard entries to display */
    entries: LeaderboardEntry[];
    /** Title of the leaderboard */
    title?: string;
    /** Custom value label (e.g., "Funds", "Hours", "Level") */
    valueLabel?: string;
    /** Maximum entries to display */
    maxEntries?: number;
}

/** Default titles for different leaderboard types */
const DEFAULT_TITLES: Record<string, string> = {
    TimePlayed: "Time Played Leaders",
    Level: "Highest Levels",
    Funds: "Richest Empires",
    Power: "Most Powerful",
    Skill: "Most Skilled",
    Donated: "Top Donors",
};

/** Default value labels for different leaderboard types */
const DEFAULT_VALUE_LABELS: Record<string, string> = {
    TimePlayed: "Hours",
    Level: "Level",
    Funds: "Funds",
    Power: "Power",
    Skill: "Skill",
    Donated: "Donated",
};

/**
 * Complete leaderboard display with header and ranked entries.
 */
export default function Leaderboard({
    leaderboardType,
    entries,
    title,
    valueLabel,
    maxEntries = 100,
}: LeaderboardProps) {
    const displayTitle = title || DEFAULT_TITLES[leaderboardType] || `${leaderboardType} Leaderboard`;
    const displayValueLabel = valueLabel || DEFAULT_VALUE_LABELS[leaderboardType] || leaderboardType;

    // Limit entries if maxEntries is specified
    const displayEntries: LeaderboardEntry[] = [];
    for (let i = 0; i < entries.size() && i < maxEntries; i++) {
        displayEntries.push(entries[i]);
    }

    let gradient: ColorSequence;
    switch (leaderboardType) {
        case "Funds":
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 144)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(0, 68, 34)),
            ]);
            break;
        case "Power":
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 155, 33)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(221, 74, 0)),
            ]);
            break;
        case "Skill":
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(85, 170, 127)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(85, 255, 127)),
            ]);
            break;
        case "TimePlayed":
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(152, 202, 255)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 255)),
            ]);
            break;
        case "Level":
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(0, 170, 255)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(0, 170, 255)),
            ]);
            break;
        case "Donated":
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 123, 152)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 85, 127)),
            ]);
            break;
        default:
            gradient = new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 0, 0)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(221, 74, 0)),
            ]);
    }

    return (
        <frame BackgroundColor3={Color3.fromRGB(255, 255, 255)} Size={new UDim2(1, 0, 1, 0)}>
            <LeaderboardHeader title={displayTitle} gradient={gradient} />
            <scrollingframe
                key="Display"
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundColor3={Color3.fromRGB(209, 209, 209)}
                BorderSizePixel={0}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                Position={new UDim2(0.1, 0, 0.12, 0)}
                Selectable={false}
                Size={new UDim2(0.8, 0, 0.8, 0)}
            >
                <uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder} />
                <uipadding
                    PaddingBottom={new UDim(0, 15)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 15)}
                />
                <ColumnHeader valueLabel={displayValueLabel} />

                {displayEntries.map((entry: LeaderboardEntry) => (
                    <LeaderboardSlot key={`entry-${entry.place}-${entry.name}`} entry={entry} />
                ))}
            </scrollingframe>
        </frame>
    );
}
