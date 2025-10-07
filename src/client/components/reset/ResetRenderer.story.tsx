import { OnoeNum } from "@rbxts/serikanum";
import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BalanceWindow from "client/components/balance/BalanceWindow";
import { CurrencyGainManager } from "client/components/balance/CurrencyGain";
import playSkillificationSequence from "client/components/reset/playSkillificationSequence";
import ResetRenderer from "client/components/reset/ResetRenderer";
import useVisibility from "client/hooks/useVisibility";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        useVisibility("Balance", true);

        return (
            <Fragment>
                <textbutton
                    AnchorPoint={new Vector2(0.5, 0)}
                    Text={"Play Skillification Sequence"}
                    Size={new UDim2(0, 300, 0, 50)}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    Event={{
                        MouseButton1Click: () => {
                            playSkillificationSequence(new OnoeNum(50));
                        },
                    }}
                />
                <ResetRenderer />
                <BalanceWindow />
                <CurrencyGainManager />
            </Fragment>
        );
    },
);
