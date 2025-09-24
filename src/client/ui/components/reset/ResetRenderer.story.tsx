import { OnoeNum } from "@antivivi/serikanum";
import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import playSkillificationSequence from "client/ui/components/reset/playSkillificationSequence";
import ResetRenderer from "client/ui/components/reset/ResetRenderer";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
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
            </Fragment>
        );
    },
);
