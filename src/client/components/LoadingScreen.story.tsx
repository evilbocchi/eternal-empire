import React, { Fragment, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { StarterGui } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import LoadingScreen from "sharedfirst/LoadingScreen";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            text: "Loading...",
            visible: true,
        },
    },
    (props) => {
        const [screenGui, setScreenGui] = useState<ScreenGui>();

        useEffect(() => {
            const screenGui = new Instance("ScreenGui");
            screenGui.IgnoreGuiInset = true;
            screenGui.ResetOnSpawn = false;
            screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
            screenGui.Parent = StarterGui;
            setScreenGui(screenGui);
            return () => {
                screenGui.Destroy();
            };
        }, []);

        if (props.controls.visible) {
            LoadingScreen.showLoadingScreen(props.controls.text, false, screenGui);
        } else {
            LoadingScreen.hideLoadingScreen();
        }
        return <Fragment />;
    },
);
