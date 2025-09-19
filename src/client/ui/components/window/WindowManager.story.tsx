import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BasicWindow from "client/ui/components/window/BasicWindow";
import WindowManager, { useDocument } from "client/ui/components/window/WindowManager";
import { getAsset } from "shared/asset/AssetMap";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        const { id: id1, visible: visible1, setVisible: setVisible1 } = useDocument({ id: "Test1", priority: 1 });
        const { id: id2, visible: visible2, setVisible: setVisible2 } = useDocument({ id: "Test2", priority: 5 });
        const { id: id3, visible: visible3, setVisible: setVisible3 } = useDocument({ id: "Test3", priority: 0 });

        return (
            <StrictMode>
                {/* Control buttons */}
                <frame
                    AnchorPoint={new Vector2(0.5, 0)}
                    Position={new UDim2(0.5, 0, 0, 10)}
                    Size={new UDim2(0, 300, 0, 60)}
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                >
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        Padding={new UDim(0, 10)}
                    />

                    <textbutton
                        Size={new UDim2(0, 80, 0, 40)}
                        Text="Window 1"
                        Event={{ Activated: () => setVisible1(!visible1) }}
                    />

                    <textbutton
                        Size={new UDim2(0, 80, 0, 40)}
                        Text="Window 2"
                        Event={{ Activated: () => setVisible2(!visible2) }}
                    />

                    <textbutton
                        Size={new UDim2(0, 80, 0, 40)}
                        Text="Window 3"
                        Event={{ Activated: () => setVisible3(!visible3) }}
                    />

                    <textbutton
                        Size={new UDim2(0, 80, 0, 40)}
                        Text="Window 3"
                        Event={{ Activated: () => WindowManager.toggle("Low Priority Window") }}
                    />
                </frame>

                {/* Test windows with different priorities */}
                <BasicWindow
                    icon={getAsset("assets/Settings.png")}
                    id={id1}
                    title="Normal Priority Window"
                    strokeColor={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(100, 150, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(50, 100, 200)),
                        ])
                    }
                    visible={visible1}
                >
                    <textlabel
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="This is a normal priority window. Press X to close the highest priority visible window."
                        TextWrapped={true}
                        TextScaled={true}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                    />
                </BasicWindow>

                <BasicWindow
                    icon={getAsset("assets/Quests.png")}
                    id={id2}
                    title="High Priority Window"
                    strokeColor={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 150, 100)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(200, 100, 50)),
                        ])
                    }
                    visible={visible2}
                >
                    <textlabel
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="This is a HIGH priority window. When multiple windows are open, X will close this one first."
                        TextWrapped={true}
                        TextScaled={true}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                    />
                </BasicWindow>

                <BasicWindow
                    icon={getAsset("assets/Inventory.png")}
                    id={id3}
                    title="Low Priority Window"
                    strokeColor={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(150, 255, 150)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(100, 200, 100)),
                        ])
                    }
                    visible={visible3}
                >
                    <textlabel
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="This is a low priority window. X will close this window last."
                        TextWrapped={true}
                        TextScaled={true}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                    />
                </BasicWindow>
            </StrictMode>
        );
    },
);
