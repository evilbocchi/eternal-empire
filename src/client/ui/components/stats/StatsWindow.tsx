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

import { OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import useWindowVisibility from "client/ui/components/sidebar/useWindowVisibility";
import SectionHeader from "client/ui/components/stats/SectionHeader";
import StatItem from "client/ui/components/stats/StatItem";
import TechWindow from "client/ui/components/window/TechWindow";
import useProperty from "client/ui/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Queue from "shared/currency/Queue";
import Packets from "shared/Packets";

export class PingManager {
    static queue = new Queue();

    static logPing(delayInSeconds: number): void {
        this.queue.add(new OnoeNum(delayInSeconds * 1000000));
    }

    static getPing() {
        return math.round(this.queue.mean().div(1000).revert()) + "ms";
    }
}

/**
 * Main stats window component displaying empire and player statistics
 * Features enhanced visual design with modern styling and smooth interactions
 */
export default function StatsWindow() {
    const { visible, closeWindow } = useWindowVisibility("Stats");

    // Observe data from packets
    const empirePlaytime = useProperty(Packets.empirePlaytime);
    const sessionTime = useProperty(Packets.sessionTime);
    const longestSessionTime = useProperty(Packets.longestSessionTime);
    const mostBalance = useProperty(Packets.mostBalance);

    // State for player attributes
    const [rawPurifierClicks, setRawPurifierClicks] = useState(0);
    const [currentPing, setCurrentPing] = useState("N/A");

    // Listen to player attributes
    useEffect(() => {
        const updateRawPurifierClicks = () => {
            setRawPurifierClicks((LOCAL_PLAYER.GetAttribute("RawPurifierClicks") as number) ?? 0);
        };

        updateRawPurifierClicks();
        const attributeConnection =
            LOCAL_PLAYER.GetAttributeChangedSignal("RawPurifierClicks").Connect(updateRawPurifierClicks);

        // Listen to ping updates
        let active = true;
        task.spawn(() => {
            while (active) {
                setCurrentPing(PingManager.getPing());
                task.wait(1);
            }
        });

        return () => {
            attributeConnection.Disconnect();
            active = false;
        };
    }, []);

    // Prepare currency stats
    const currencyStats = [];
    for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
        const amount = mostBalance.get(currency);
        if (amount && !new OnoeNum(amount).lessEquals(0)) {
            currencyStats.push({
                currency,
                amount: new OnoeNum(amount),
                layoutOrder: 50 + details.layoutOrder,
            });
        }
    }

    // Sort currency stats by layout order
    currencyStats.sort((a, b) => a.layoutOrder < b.layoutOrder);

    return (
        <TechWindow
            visible={visible}
            icon={getAsset("assets/Stats.png")}
            title="Statistics"
            onClose={closeWindow}
            windowId="stats"
            priority={5}
        >
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
                    {currencyStats.size() > 0 ? (
                        <Fragment>
                            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 25)} />
                            <SectionHeader title="Currency Records" icon={getAsset("assets/Currency.png")} />
                        </Fragment>
                    ) : undefined}

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
