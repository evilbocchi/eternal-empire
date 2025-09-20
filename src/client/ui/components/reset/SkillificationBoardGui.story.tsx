import React, { Fragment, StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SkillificationBoardGui from "client/ui/components/reset/SkillificationBoardGui";
import useExternalRender from "client/ui/hooks/useExternalRender";
import SkillificationBoard from "shared/world/nodes/SkillificationBoard";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        const element = (
            <StrictMode>
                <SkillificationBoardGui />
            </StrictMode>
        );

        useExternalRender({ element, parent: SkillificationBoard.waitForInstance() });

        return <Fragment />;
    },
);
