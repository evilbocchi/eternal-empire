/**
 * @fileoverview Enhanced React TSX implementation of the stats window using TechWindow
 *
 * Displays player and empire statistics in a modern, clean format with:
 * - Enhanced visual design with gradients and hover effects
 * - Organized sections with styled headers
 * - Accent highlighting for important statistics
 * - Smooth animations and improved spacing
 *
 * Replaces the old Roblox Studio UI with maintainable React components.
 */

import { OnoeNum } from "@rbxts/serikanum";
import { convertToHHMMSS } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { LOCAL_PLAYER } from "shared/constants";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import SectionHeader from "client/components/stats/SectionHeader";
import StatItem from "client/components/stats/StatItem";
import TechWindow from "client/components/window/TechWindow";
import useInterval from "client/hooks/useInterval";
import useProperty from "client/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Queue from "shared/currency/Queue";
import Packets from "shared/Packets";

export namespace PingManager {
    const queue = new Queue();

    export function logPing(delayInSeconds: number): void {
        queue.add(new OnoeNum(delayInSeconds * 1000000));
    }

    export function getPing() {
        return math.round(queue.mean().div(1000).revert()) + "ms";
    }
}

/**
 * Main stats window component displaying empire and player statistics
 * Features enhanced visual design with modern styling and smooth interactions
 */
export default function StatsWindow() {
    const { id, visible } = useSingleDocument({ id: "Stats" });

    // Observe data from packets
    const empirePlaytime = useProperty(Packets.empirePlaytime);
    const sessionTime = useProperty(Packets.sessionTime);
    const longestSessionTime = useProperty(Packets.longestSessionTime);
    const mostBalance = useProperty(Packets.mostBalance);
    const rawPurifierClicks = useProperty(Packets.rawPurifierClicks);

    // State for player attributes
    const [currentPing, setCurrentPing] = useState("N/A");

    useInterval(() => {
        setCurrentPing(PingManager.getPing());
        return 1;
    }, []);

    // Prepare currency stats
    const currencyStats = [];
    for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
        const amount = mostBalance.get(currency);

        if (currency === "Funds") {
            currencyStats.push({
                currency,
                amount: new OnoeNum(amount ?? 0),
                layoutOrder: details.layoutOrder,
            });
            continue;
        }

        if (amount && !new OnoeNum(amount).lessEquals(0)) {
            currencyStats.push({
                currency,
                amount: new OnoeNum(amount),
                layoutOrder: details.layoutOrder,
            });
        }
    }

    // Sort currency stats by layout order
    currencyStats.sort((a, b) => a.layoutOrder < b.layoutOrder);

    return (
        <TechWindow visible={visible} icon={getAsset("assets/Stats.png")} id={id} title="Statistics">
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                <scrollingframe
                    key="StatList"
                    AnchorPoint={new Vector2(0.5, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    ScrollBarThickness={8}
                    ScrollBarImageColor3={Color3.fromRGB(100, 100, 120)}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        Padding={new UDim(0, 12)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                    <uipadding
                        PaddingBottom={new UDim(0, 15)}
                        PaddingLeft={new UDim(0, 15)}
                        PaddingRight={new UDim(0, 15)}
                        PaddingTop={new UDim(0, 15)}
                    />

                    {/* Empire Statistics Section */}
                    <SectionHeader title="Empire Statistics" layoutOrder={0} icon={getAsset("assets/Empire.png")} />

                    <StatItem
                        key="Playtime"
                        label="Server Playtime"
                        value={convertToHHMMSS(empirePlaytime)}
                        accent={true}
                    />

                    <StatItem key="SessionTime" label="Session Time" value={convertToHHMMSS(sessionTime)} />

                    <StatItem
                        key="LongestSessionTime"
                        label="Longest Session Time"
                        value={convertToHHMMSS(longestSessionTime)}
                        accent={true}
                    />

                    {/* Player Statistics Section */}
                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 15)} />
                    <SectionHeader title="Player Statistics" icon={getAsset("assets/Empire.png")} />

                    <StatItem
                        key="RawPurifierClicks"
                        label="Raw Purifier Clicks"
                        value={tostring(rawPurifierClicks)}
                        accent={true}
                    />

                    <StatItem key="CurrentPing" label="Droplet Ping" value={currentPing} />

                    {/* Currency Statistics Section */}
                    <Fragment>
                        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 25)} />
                        <SectionHeader title="Currency Records" icon={getAsset("assets/Currency.png")} />
                    </Fragment>

                    {currencyStats.map((stat) => (
                        <StatItem
                            key={`Most${stat.currency}`}
                            label={`Most ${stat.currency}`}
                            image={CURRENCY_DETAILS[stat.currency].image}
                            value={CurrencyBundle.getFormatted(stat.currency, stat.amount, true)}
                            accent={CURRENCY_DETAILS[stat.currency].page === CURRENCY_CATEGORIES.Main}
                        />
                    ))}
                </scrollingframe>
            </frame>
        </TechWindow>
    );
}
