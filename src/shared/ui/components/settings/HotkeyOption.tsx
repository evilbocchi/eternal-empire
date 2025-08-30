import React from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMonoBold } from "shared/ui/GameFonts";

interface HotkeyOptionProps {
    title: string;
    keyText: string;
    layoutOrder?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onHotkeyChange?: (newKeyCode: Enum.KeyCode) => void;
    onDeselect?: () => void;
}

export default function HotkeyOption({ title, keyText, layoutOrder = 0, isSelected = false, onSelect, onHotkeyChange, onDeselect }: HotkeyOptionProps) {
    const toggleColor = isSelected ? Color3.fromRGB(255, 138, 138) : Color3.fromRGB(85, 255, 127);
    const displayText = isSelected ? ".." : keyText;

    const handleSelect = () => {
        if (!isSelected) {
            playSound("CheckOff.mp3");
        }
        else {
            playSound("CheckOn.mp3");
        }
        onSelect?.();
    };

    // Listen for key presses when this hotkey option is selected
    React.useEffect(() => {
        if (!isSelected || !onHotkeyChange) return;

        const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            // Only accept actual key presses, not mouse clicks or unknown keys
            if (input.KeyCode !== Enum.KeyCode.Unknown && input.UserInputType === Enum.UserInputType.Keyboard) {
                onHotkeyChange(input.KeyCode);
                playSound("CheckOn.mp3");
                // Auto-deselect after setting the hotkey
                onDeselect?.();
            }
        });

        return () => connection.Disconnect();
    }, [isSelected, onHotkeyChange, onDeselect]);

    // Handle deselection when pressing Escape key
    React.useEffect(() => {
        if (!isSelected) return;

        const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            // Deselect on Escape key press
            if (input.KeyCode === Enum.KeyCode.Escape) {
                onDeselect?.();
            }
        });

        return () => connection.Disconnect();
    }, [isSelected, onDeselect]); return (
        <frame
            BackgroundTransparency={1}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 40)}
        >
            <textbutton
                key="Bind"
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundColor3={toggleColor}
                BorderColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={3}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.975, 0, 0.5, 0)}
                Size={new UDim2(0.75, 0, 0.75, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                Text=""
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
                TextStrokeTransparency={0}
                TextWrapped={true}
                ZIndex={25}
                Event={{
                    Activated: handleSelect,
                    MouseEnter: () => {
                        playSound("EmphasisButtonHover.mp3", undefined, (sound) => {
                            sound.Volume = 0.1;
                            sound.PlaybackSpeed = 2;
                        });
                    }
                }}
            >
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))
                    ])}
                    Rotation={90}
                />
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={toggleColor}
                    Thickness={2}
                >
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))
                        ])}
                    />
                </uistroke>
                <uistroke Color={toggleColor}>
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))
                        ])}
                    />
                </uistroke>
                <textlabel
                    key="KeybindLabel"
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.8, 0, 0.8, 0)}
                    Text={displayText}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextStrokeTransparency={0}
                    ZIndex={26}
                />
            </textbutton>
            <textlabel
                key="TitleLabel"
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                LayoutOrder={-1}
                Position={new UDim2(0.025, 0, 0.5, 0)}
                Text={title}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextStrokeTransparency={0}
                ZIndex={25}
            />
        </frame>
    );
}