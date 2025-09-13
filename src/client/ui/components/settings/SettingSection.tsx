import React from "@rbxts/react";
import { RobotoMonoBold } from "client/ui/GameFonts";

interface SettingSectionProps {
    title: string;
    layoutOrder?: number;
}

export default function SettingSection({ title, layoutOrder = 0 }: SettingSectionProps) {
    return (
        <frame
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 0)}
        >
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0, 200, 0, 35)}
                Text={title}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 30)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(30, 30, 30)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
            <frame
                key="Line"
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                LayoutOrder={99}
                Position={new UDim2(0, 0, 1, 0)}
                Size={new UDim2(1, 0, 0, 3)}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(208, 208, 208)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(208, 208, 208)),
                        ])
                    }
                    Transparency={
                        new NumberSequence([
                            new NumberSequenceKeypoint(0, 0, 0),
                            new NumberSequenceKeypoint(0.5, 0, 0),
                            new NumberSequenceKeypoint(1, 1, 0),
                        ])
                    }
                />
            </frame>
            <uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
            <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
        </frame>
    );
}
