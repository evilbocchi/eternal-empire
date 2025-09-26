import { OnoeNum } from "@antivivi/serikanum";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import StatsWindow, { PingManager } from "client/components/stats/StatsWindow";
import StoryMocking from "client/components/StoryMocking";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";
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

        useSingleDocumentVisibility("Stats", props.controls.visible);

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
