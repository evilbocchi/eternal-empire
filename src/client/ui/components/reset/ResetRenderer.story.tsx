import { OnoeNum } from "@antivivi/serikanum";
import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import { CurrencyGainManager } from "client/ui/components/balance/CurrencyGain";
import playSkillificationSequence from "client/ui/components/reset/playSkillificationSequence";
import ResetRenderer from "client/ui/components/reset/ResetRenderer";
import useVisibility from "client/ui/hooks/useVisibility";

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
