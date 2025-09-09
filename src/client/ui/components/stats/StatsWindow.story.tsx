import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import { SidebarManager } from "client/ui/components/sidebar/SidebarButtons";
import StatsWindow, { PingManager } from "client/ui/components/stats/StatsWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        StoryMocking.mockData();

        useEffect(() => {
            if (props.controls.visible) {
                SidebarManager.openWindow("Stats");
            } else {
                SidebarManager.closeWindow("Stats");
            }
        }, [props.controls.visible]);

        for (let i = 0; i < 10; i++) {
            PingManager.logPing(math.random(50, 300) / 1000); // Simulate random ping
        }
        const balance = new CurrencyBundle();
        for (const [currency] of pairs(CURRENCY_DETAILS)) {
            balance.set(currency, new OnoeNum(math.random(1, 5000)));
        }
        Packets.mostBalance.set(balance.amountPerCurrency);

        return <StatsWindow />;
    },
);
