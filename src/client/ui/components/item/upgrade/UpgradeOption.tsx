import React from "@rbxts/react";
import { RobotoMonoBold } from "client/ui/GameFonts";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

export default function UpgradeOption({
    upgrade,
    amount,
    isMaxed,
    onSelect,
    isSelected,
}: {
    upgrade: NamedUpgrade;
    amount: number;
    isMaxed: boolean;
    onSelect: () => void;
    isSelected: boolean;
}) {
    // Selection colors
    const selectedColors = {
        primary: Color3.fromRGB(85, 170, 255),
        secondary: Color3.fromRGB(120, 200, 255),
        glow: Color3.fromRGB(170, 220, 255),
    };

    const normalColors = {
        primary: Color3.fromRGB(75, 75, 85),
        secondary: Color3.fromRGB(95, 95, 105),
        glow: Color3.fromRGB(155, 155, 165),
    };

    const colors = isSelected ? selectedColors : normalColors;

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(0, 125, 0, 141)}>
            <frame BackgroundTransparency={1} Size={new UDim2(0, 125, 0, 125)}>
                {/* Outer glow effect */}
                <frame
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundColor3={colors.glow}
                    BackgroundTransparency={isSelected ? 0.3 : 0.8}
                    BorderSizePixel={0}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1.1, 0, 1.1, 0)}
                    ZIndex={-2}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, colors.glow),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                            ])
                        }
                        Rotation={45}
                    />
                </frame>

                {/* Shadow */}
                <frame
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundColor3={Color3.fromRGB(15, 15, 25)}
                    BorderSizePixel={0}
                    Position={new UDim2(0.5, 3, 0.5, 3)}
                    Size={new UDim2(0.95, 0, 0.95, 0)}
                    ZIndex={-1}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />
                </frame>

                {/* Main button */}
                <textbutton
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                    BorderSizePixel={0}
                    Text=""
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Selectable={false}
                    Size={new UDim2(0.95, 0, 0.95, 0)}
                    ZIndex={1}
                    Event={{
                        Activated: onSelect,
                    }}
                >
                    <imagelabel
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        Image={upgrade.image}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.9, 0, 0.9, 0)}
                    />
                    <uicorner CornerRadius={new UDim(0, 8)} />

                    {/* Main gradient */}
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(245, 245, 245)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(195, 195, 205)),
                            ])
                        }
                        Rotation={90}
                    />

                    {/* Border stroke */}
                    <uistroke
                        ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                        Color={colors.primary}
                        Thickness={isSelected ? 4 : 2}
                    >
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, colors.primary),
                                    new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, colors.secondary),
                                ])
                            }
                            Rotation={35}
                        />
                    </uistroke>

                    {/* Selection indicator overlay */}
                    {isSelected && (
                        <frame
                            BackgroundColor3={selectedColors.primary}
                            BackgroundTransparency={0.85}
                            BorderSizePixel={0}
                            Size={new UDim2(1, 0, 1, 0)}
                            ZIndex={2}
                        >
                            <uicorner CornerRadius={new UDim(0, 8)} />
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, selectedColors.primary),
                                        new ColorSequenceKeypoint(1, selectedColors.secondary),
                                    ])
                                }
                                Rotation={45}
                            />
                        </frame>
                    )}
                </textbutton>
            </frame>

            {/* Amount/Status label */}
            <frame
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={isMaxed ? Color3.fromRGB(255, 215, 0) : Color3.fromRGB(85, 170, 255)}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0, 125)}
                Size={new UDim2(0.8, 0, 0.25, 0)}
                ZIndex={3}
            >
                <uicorner CornerRadius={new UDim(0, 6)} />
                <uigradient
                    Color={
                        isMaxed
                            ? new ColorSequence([
                                  new ColorSequenceKeypoint(0, Color3.fromRGB(255, 215, 0)),
                                  new ColorSequenceKeypoint(1, Color3.fromRGB(255, 165, 0)),
                              ])
                            : new ColorSequence([
                                  new ColorSequenceKeypoint(0, Color3.fromRGB(85, 170, 255)),
                                  new ColorSequenceKeypoint(1, Color3.fromRGB(65, 140, 215)),
                              ])
                    }
                    Rotation={90}
                />
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={2} />

                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={isMaxed ? "MAXED" : tostring(amount)}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                    ZIndex={4}
                >
                    <uistroke Thickness={2} />
                </textlabel>
            </frame>
        </frame>
    );
}
