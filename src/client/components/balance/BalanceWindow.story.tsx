import { OnoeNum } from "@rbxts/serikanum";
import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Debris, Workspace } from "@rbxts/services";
import { CreateReactStory, Number } from "@rbxts/ui-labs";
import BalanceWindow from "client/components/balance/BalanceWindow";
import { CurrencyGainManager } from "client/components/balance/CurrencyGain";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import useVisibility from "client/hooks/useVisibility";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES } from "shared/currency/CurrencyDetails";
import Droplet from "shared/item/Droplet";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            visibleCurrencies: Number(CURRENCIES.size(), 0, CURRENCIES.size(), 1, true),
            currencyBombTime: 0,
            difference: 0,
        },
    },
    (props) => {
        const [gainAmount, setGainAmount] = React.useState(new OnoeNum(1));
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
            const bombEndTimes = Packets.bombEndTimes.get();
            for (const currency of CURRENCIES) {
                bombEndTimes.set(currency, os.time() + props.controls.currencyBombTime);
            }
            Packets.bombEndTimes.set(bombEndTimes);
        }, [props.controls.currencyBombTime]);

        useEffect(() => {
            const newDifference = new Map<Currency, OnoeNum>();
            for (const currency of CURRENCIES) {
                newDifference.set(currency, new OnoeNum(props.controls.difference));
            }
            Packets.showDifference.toAllClients(newDifference);
        }, [props.controls.difference]);

        useEffect(() => {
            const mockDroplet = Droplet.TheFirstDroplet.model.Clone();
            mockDroplet.Parent = Workspace;
            mockDroplet.Position = new Vector3(0, 0, 0);
            Debris.AddItem(mockDroplet, 5);

            const amountPerCurrency = new Map<Currency, OnoeNum>();
            for (const currency of CURRENCIES) {
                amountPerCurrency.set(currency, new OnoeNum(gainAmount));
            }
            Packets.dropletBurnt.toAllClients(mockDroplet.Name, amountPerCurrency);
        }, [gainAmount]);

        useVisibility("Balance", props.controls.visible);
        return (
            <StrictMode>
                <BalanceWindow />
                <CurrencyGainManager />
                <TooltipWindow />
                <textbutton
                    AnchorPoint={new Vector2(0.5, 1)}
                    Position={new UDim2(0.5, 0, 1, -50)}
                    Size={new UDim2(0, 200, 0, 50)}
                    Text="+1 Gain"
                    Event={{
                        MouseButton1Click: () => {
                            setGainAmount(gainAmount.add(1));
                        },
                    }}
                />
            </StrictMode>
        );
    },
);
