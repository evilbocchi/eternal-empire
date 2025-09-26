import React from "@rbxts/react";
import { RobotoSlabBold } from "client/GameFonts";

interface SectionHeaderProps {
    title: string;
    layoutOrder?: number;
    icon: string;
}

/**
 * Enhanced section header component for organizing statistics into categories
 */
export default function SectionHeader({ title, layoutOrder, icon }: SectionHeaderProps) {
    return (
        <frame
            BackgroundColor3={Color3.fromRGB(25, 25, 30)}
            BackgroundTransparency={0.2}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 45)}
        >
            <canvasgroup BackgroundTransparency={1} BorderSizePixel={0} Size={new UDim2(1, 0, 1, 0)} ZIndex={-1}>
                <uicorner CornerRadius={new UDim(0, 8)} />

                <frame BorderSizePixel={0} Size={new UDim2(1, 0, 1, 0)} ZIndex={-2}>
                    <uicorner CornerRadius={new UDim(0, 8)} />
                    {/* Gradient overlay for depth */}
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(50, 50, 60)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 30)),
                            ])
                        }
                        Rotation={90}
                        Transparency={
                            new NumberSequence([new NumberSequenceKeypoint(0, 0.7), new NumberSequenceKeypoint(1, 0.3)])
                        }
                    />
                </frame>

                <uistroke Color={Color3.fromRGB(80, 80, 90)} Thickness={1} Transparency={0.4} />

                {/* Left accent line */}
                <frame
                    key="AccentBar"
                    BackgroundColor3={Color3.fromRGB(253, 84, 137)}
                    BorderSizePixel={0}
                    Size={new UDim2(0, 4, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                />
            </canvasgroup>

            {/* Left padding to account for accent line */}
            <frame key="LeftSpace" BackgroundTransparency={1} Size={new UDim2(0, 15, 1, 0)} LayoutOrder={0} />

            {/* Icon (if provided) */}
            <imagelabel
                key="Icon"
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                Image={icon}
                Position={new UDim2(0, 10, 0.5, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0, 50, 1, -10)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                LayoutOrder={1}
            />

            <textlabel
                key="HeaderText"
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0, 70, 0.5, 0)}
                Size={new UDim2(0, 200, 0.7, 0)}
                Text={title}
                TextColor3={Color3.fromRGB(220, 220, 230)}
                TextScaled={true}
                TextSize={18}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                LayoutOrder={2}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} Transparency={0.3} />
            </textlabel>
        </frame>
    );
}
