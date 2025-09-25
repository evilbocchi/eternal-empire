import React, { createRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import ActionButton from "client/ui/components/item/printer/ActionButton";
import ToggleSwitch from "client/ui/components/item/printer/ToggleSwitch";
import { RobotoSlabBold } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

export default function SetupOption({
    placementId = "Printer1",
    setupName = "Setup 1",
    cost = "Cost: $1Qd, 100 W, 140 Purifier Clicks",
}: {
    placementId?: string;
    setupName?: string;
    cost?: string;
}) {
    const textBoxRef = createRef<TextBox>();
    const onSave = () => {
        playSound("MagicSprinkle.mp3", undefined, (sound) => {
            sound.PlaybackSpeed = 1.15;
        });
        const text = textBoxRef.current?.Text;
        if (!text || text.size() === 0) return;
        Packets.saveSetup.toServer(placementId, text);
    };

    const onLoad = () => {
        playSound("MagicSprinkle.mp3", undefined, (sound) => {
            sound.PlaybackSpeed = 0.95;
            const reverb = new Instance("ReverbSoundEffect");
            reverb.Parent = sound;
        });
        Packets.loadSetup.toServer(placementId, setupName);
    };

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={0.8}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, 125)}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <frame BackgroundTransparency={1} Size={new UDim2(1, -60, 0.33, 0)}>
                <imagebutton
                    BackgroundTransparency={1}
                    Image={getAsset("assets/PrinterNameEdit.png")}
                    ImageTransparency={0.1}
                    LayoutOrder={2}
                    Size={new UDim2(0.6, 0, 0.6, 0)}
                    Event={{
                        Activated: () => {
                            textBoxRef.current?.CaptureFocus();
                        },
                        MouseEnter: (rbx) => {
                            const tween = TweenService.Create(
                                rbx,
                                new TweenInfo(0.2, Enum.EasingStyle.Bounce, Enum.EasingDirection.Out),
                                { Size: new UDim2(0.65, 0, 0.65, 0) },
                            );
                            tween.Play();
                        },
                        MouseLeave: (rbx) => {
                            const tween = TweenService.Create(
                                rbx,
                                new TweenInfo(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                                { Size: new UDim2(0.6, 0, 0.6, 0) },
                            );
                            tween.Play();
                        },
                        MouseButton1Down: (rbx) => {
                            const tween = TweenService.Create(
                                rbx,
                                new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut),
                                { Size: new UDim2(0.55, 0, 0.55, 0) },
                            );
                            tween.Play();
                        },
                        MouseButton1Up: (rbx) => {
                            const tween = TweenService.Create(
                                rbx,
                                new TweenInfo(0.2, Enum.EasingStyle.Bounce, Enum.EasingDirection.Out),
                                { Size: new UDim2(0.65, 0, 0.65, 0) },
                            );
                            tween.Play();
                        },
                    }}
                >
                    <uiaspectratioconstraint />
                </imagebutton>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalFlex={Enum.UIFlexAlignment.Fill}
                    Padding={new UDim(0, 15)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <textbox
                    ref={textBoxRef}
                    Active={false}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    ClearTextOnFocus={false}
                    FontFace={RobotoSlabBold}
                    LayoutOrder={-5}
                    Selectable={false}
                    Size={new UDim2(0, 0, 0.8, 0)}
                    Text={setupName}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextEditable={false}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                    Event={{
                        FocusLost: (rbx, enterPressed) => {
                            if (!enterPressed) return;
                            Packets.renameSetup.toServer(setupName, rbx.Text);
                        },
                    }}
                >
                    <uistroke Thickness={2} />
                    <frame
                        AnchorPoint={new Vector2(0, 1)}
                        BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                        BackgroundTransparency={0.8}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 0, 1, 0)}
                        Size={new UDim2(1, 6, 0, 2)}
                    />
                </textbox>
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    LayoutOrder={5}
                    Size={new UDim2(0, 0, 0.8, 0)}
                    Text={cost}
                    TextColor3={Color3.fromRGB(170, 255, 127)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Right}
                >
                    <uistroke Thickness={2} />
                    <uitextsizeconstraint MaxTextSize={22} />
                </textlabel>
            </frame>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.66, 0)}>
                <ActionButton text="Save" backgroundColor={Color3.fromRGB(170, 255, 127)} onClick={onSave} />
                <ActionButton
                    text="Load"
                    backgroundColor={Color3.fromRGB(255, 170, 0)}
                    layoutOrder={1}
                    onClick={onLoad}
                />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0.025, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <ToggleSwitch label="Alert when affordable" setupName={setupName} />
            </frame>
        </frame>
    );
}
