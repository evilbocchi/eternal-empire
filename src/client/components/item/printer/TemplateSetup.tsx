import React, { createRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import ActionButton from "client/components/item/printer/ActionButton";
import { RobotoSlabBold } from "client/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

export default function TemplateSetup({
    placementId = "Printer1",
    defaultSetupName = "Setup 1",
}: {
    placementId?: string;
    defaultSetupName?: string;
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

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={0.8}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, 125)}
            LayoutOrder={95211925} // High layout order to appear at the bottom
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            {/* Header section with name input */}
            <frame BackgroundTransparency={1} Size={new UDim2(1, -60, 0.33, 0)}>
                <imagebutton
                    BackgroundTransparency={1}
                    Image={getAsset("assets/PrinterNameEdit.png")}
                    ImageTransparency={0.1}
                    LayoutOrder={2}
                    Size={new UDim2(0.6, 0, 0.6, 0)}
                    Visible={false} // Hidden for template as name is always editable
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
                    Text={defaultSetupName}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextEditable={true} // Always editable for template
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                    Event={{
                        FocusLost: (rbx, enterPressed) => {
                            if (!enterPressed) return;
                            // For template, save when enter is pressed
                            onSave();
                        },
                    }}
                >
                    <uistroke Thickness={2} />
                    {/* Always show underline for template */}
                    <frame
                        AnchorPoint={new Vector2(0, 1)}
                        BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                        BackgroundTransparency={0.8}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 0, 1, 0)}
                        Size={new UDim2(1, 6, 0, 2)}
                    />
                </textbox>
                {/* No cost label for template */}
            </frame>
            {/* Body section with only save button */}
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.66, 0)}>
                <ActionButton text="Save" backgroundColor={Color3.fromRGB(170, 255, 127)} onClick={onSave} />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0.025, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                {/* No Load button or Toggle switch for template */}
            </frame>
        </frame>
    );
}
