import React from "@rbxts/react";
import { RobotoMonoBold } from "client/GameFonts";

export default function PurchaseOption({
    label,
    cost,
    isMaxed,
    onPurchase,
}: {
    label: string;
    cost: string;
    isMaxed: boolean;
    onPurchase: () => void;
}) {
    // Color scheme for button states
    const buttonColors = {
        normal: {
            primary: Color3.fromRGB(85, 170, 255),
            secondary: Color3.fromRGB(120, 200, 255),
            background: Color3.fromRGB(65, 140, 215),
        },
        maxed: {
            primary: Color3.fromRGB(150, 150, 150),
            secondary: Color3.fromRGB(180, 180, 180),
            background: Color3.fromRGB(120, 120, 120),
        },
    };

    const colors = isMaxed ? buttonColors.maxed : buttonColors.normal;

    return (
        <frame Active={true} BackgroundTransparency={1} Size={new UDim2(1, 0, 0.28, 0)}>
            {/* Button shadow */}
            <frame
                BackgroundColor3={Color3.fromRGB(15, 15, 25)}
                BorderSizePixel={0}
                Position={new UDim2(0, 3, 0, 3)}
                Size={new UDim2(0.35, 0, 1, 0)}
                ZIndex={0}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
            </frame>

            {/* Main button */}
            <textbutton
                BackgroundColor3={colors.background}
                BorderSizePixel={0}
                Size={new UDim2(0.35, 0, 1, 0)}
                Text=""
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={14}
                Active={!isMaxed}
                ZIndex={1}
                Event={{
                    Activated: onPurchase,
                }}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />

                {/* Button gradient */}
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, colors.primary),
                            new ColorSequenceKeypoint(1, colors.background),
                        ])
                    }
                    Rotation={90}
                />

                {/* Button border */}
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(255, 255, 255)}
                    Thickness={2}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.5, colors.secondary),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                            ])
                        }
                        Rotation={35}
                    />
                </uistroke>

                {/* Button label */}
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.9, 0, 0.8, 0)}
                    Text={label}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextWrapped={true}
                >
                    <uistroke Thickness={2} />
                </textlabel>

                {/* Hover effect overlay */}
                {!isMaxed && (
                    <frame
                        BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                        BackgroundTransparency={0.95}
                        BorderSizePixel={0}
                        Size={new UDim2(1, 0, 1, 0)}
                        ZIndex={2}
                        Active={false}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                    </frame>
                )}
            </textbutton>

            {/* Cost display panel */}
            <frame
                BackgroundColor3={Color3.fromRGB(35, 35, 45)}
                BorderSizePixel={0}
                Position={new UDim2(0.38, 0, 0, 0)}
                Size={new UDim2(0.62, 0, 1, 0)}
                ZIndex={1}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />

                {/* Cost panel gradient */}
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(45, 45, 55)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                        ])
                    }
                    Rotation={90}
                />

                {/* Cost panel border */}
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(85, 85, 95)}
                    Thickness={2}
                />

                {/* Cost text */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Size={new UDim2(1, -10, 1, 0)}
                    Position={new UDim2(0, 10, 0, 0)}
                    Text={isMaxed ? "MAXED" : cost}
                    TextColor3={isMaxed ? Color3.fromRGB(255, 215, 0) : Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={2}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(25, 25, 35)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(85, 170, 255)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>

                {/* Maxed indicator overlay */}
                {isMaxed && (
                    <frame
                        BackgroundColor3={Color3.fromRGB(255, 215, 0)}
                        BackgroundTransparency={0.85}
                        BorderSizePixel={0}
                        Size={new UDim2(1, 0, 1, 0)}
                        ZIndex={2}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 215, 0)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 165, 0)),
                                ])
                            }
                            Rotation={45}
                        />
                    </frame>
                )}
            </frame>
        </frame>
    );
}
