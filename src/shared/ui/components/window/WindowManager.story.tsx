import React, { useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { getAsset } from "shared/asset/AssetMap";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";
import BasicWindow from "shared/ui/components/window/BasicWindow";
import WindowManager from "shared/ui/components/window/WindowManager";

export = {
    react: React,
    reactRoblox: ReactRoblox,
    story: () => {
        const [window1Visible, setWindow1Visible] = useState(false);
        const [window2Visible, setWindow2Visible] = useState(false);
        const [window3Visible, setWindow3Visible] = useState(false);

        return (
            <HotkeyProvider>
                <WindowManager>
                    <TooltipProvider>
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
                                Event={{ Activated: () => setWindow1Visible(!window1Visible) }}
                            />

                            <textbutton
                                Size={new UDim2(0, 80, 0, 40)}
                                Text="Window 2"
                                Event={{ Activated: () => setWindow2Visible(!window2Visible) }}
                            />

                            <textbutton
                                Size={new UDim2(0, 80, 0, 40)}
                                Text="Window 3"
                                Event={{ Activated: () => setWindow3Visible(!window3Visible) }}
                            />
                        </frame>

                        {/* Test windows with different priorities */}
                        <BasicWindow
                            visible={window1Visible}
                            icon={getAsset("assets/Settings.png")}
                            title="Normal Priority Window"
                            colorSequence={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(100, 150, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(50, 100, 200)),
                                ])
                            }
                            onClose={() => setWindow1Visible(false)}
                            windowId="test-window-1"
                            priority={1}
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
                            visible={window2Visible}
                            icon={getAsset("assets/Quests.png")}
                            title="High Priority Window"
                            colorSequence={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 150, 100)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(200, 100, 50)),
                                ])
                            }
                            onClose={() => setWindow2Visible(false)}
                            windowId="test-window-2"
                            priority={5}
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
                            visible={window3Visible}
                            icon={getAsset("assets/Inventory.png")}
                            title="Low Priority Window"
                            colorSequence={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(150, 255, 150)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(100, 200, 100)),
                                ])
                            }
                            onClose={() => setWindow3Visible(false)}
                            windowId="test-window-3"
                            priority={0}
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
                    </TooltipProvider>
                </WindowManager>
            </HotkeyProvider>
        );
    },
};
