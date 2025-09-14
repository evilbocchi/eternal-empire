import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory, Number } from "@rbxts/ui-labs";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import WindowManager from "client/ui/components/window/WindowManager";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES } from "shared/currency/CurrencyDetails";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            visibleCurrencies: Number(CURRENCIES.size(), 0, CURRENCIES.size(), 1, true),
        },
    },
    (props) => {
        StoryMocking.mockData();

        const removingCurrencies = CURRENCIES.size() - props.controls.visibleCurrencies;
        if (removingCurrencies > 0) {
            const newBalance = Packets.balance.get();
            let count = 0;
            const reversedSortedCurrencies = new Array<Currency>();
            for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
                reversedSortedCurrencies.unshift(currency);
            }
            for (const currency of reversedSortedCurrencies) {
                newBalance.delete(currency);
                count++;
                if (count >= removingCurrencies) break;
            }

            Packets.balance.set(newBalance);
        }

        useEffect(() => {
            WindowManager.setWindowVisible("Balance", props.controls.visible);
        }, [props.controls.visible]);

        return <BalanceWindow />;
    },
);
