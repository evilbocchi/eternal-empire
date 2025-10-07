import React, { Fragment, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import runTests from "shared/hamster/runTests";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        useEffect(() => {
            runTests();
        });
        return <Fragment />;
    },
);
