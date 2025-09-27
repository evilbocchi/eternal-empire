import React, { useRef } from "@rbxts/react";
import { RobotoSlabBold, RobotoSlabMedium } from "shared/asset/GameFonts";
import useHover from "client/hooks/useHover";

interface StatItemProps {
    label: string;
    value: string;
    image?: string; // Optional image prop for currency icons
    layoutOrder?: number;
    accent?: boolean; // For highlighting important stats
}

/**
 * Enhanced reusable component for displaying individual stat items with label and value
 */
export default function StatItem({ label, value, image, layoutOrder, accent = false }: StatItemProps) {
    const frameRef = useRef<Frame>();
    const { hovering, events } = useHover({});

    const backgroundColor = accent
        ? Color3.fromRGB(45, 85, 125) // Blue accent for important stats
        : Color3.fromRGB(35, 35, 40); // Dark gray for regular stats

    const borderColor = accent
        ? Color3.fromRGB(70, 130, 180) // Steel blue border
        : Color3.fromRGB(60, 60, 65); // Subtle gray border

    return (
        <frame
            ref={frameRef}
            BackgroundTransparency={1}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 30)}
            Event={{ ...events }}
        >
            <canvasgroup BackgroundTransparency={1} BorderSizePixel={0} Size={new UDim2(1, 0, 1, 0)} ZIndex={-1}>
                <uicorner CornerRadius={new UDim(0, 8)} />

                <frame
                    BackgroundColor3={hovering ? backgroundColor.Lerp(new Color3(255, 255, 255), 0.2) : backgroundColor}
                    BackgroundTransparency={accent ? 0.3 : 0.4}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 1, 0)}
                    ZIndex={-2}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />
                    {/* Gradient overlay for depth */}
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(180, 180, 180)),
                            ])
                        }
                        Rotation={90}
                        Transparency={
                            new NumberSequence([
                                new NumberSequenceKeypoint(0, 0.9),
                                new NumberSequenceKeypoint(1, 0.95),
                            ])
                        }
                    />
                </frame>

                <uistroke Color={borderColor} Thickness={1.5} Transparency={0.3} />

                {/* Left accent bar for important stats */}
                <frame
                    key="AccentBar"
                    BackgroundColor3={Color3.fromRGB(100, 180, 255)}
                    BorderSizePixel={0}
                    Size={new UDim2(0, 4, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                    Visible={accent}
                />
            </canvasgroup>

            {/* Add padding from left edge */}
            <frame
                key="LeftPadding"
                BackgroundTransparency={1}
                Size={new UDim2(0, accent ? 10 : 5, 1, 0)}
                LayoutOrder={0}
            />

            <imagelabel
                key="CurrencyIcon"
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                Image={image ?? ""}
                Position={new UDim2(0, 20, 0.5, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0, 20, 0.8, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                Visible={image !== undefined}
            />

            <textlabel
                key="StatLabel"
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(0.55, 0, 0.8, 0)}
                Text={label}
                TextColor3={Color3.fromRGB(240, 240, 245)}
                TextScaled={true}
                TextSize={16}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                Position={new UDim2(0, 50, 0.5, 0)}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} Transparency={0.5} />
            </textlabel>

            <textlabel
                key="AmountLabel"
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Size={new UDim2(0.35, 0, 0.8, 0)}
                Text={value}
                TextColor3={accent ? Color3.fromRGB(150, 220, 255) : Color3.fromRGB(200, 200, 205)}
                TextScaled={true}
                TextSize={16}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Right}
                Position={new UDim2(1, -20, 0.5, 0)}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} Transparency={0.5} />
            </textlabel>

            {/* Right padding */}
            <frame key="RightPadding" BackgroundTransparency={1} Size={new UDim2(0, 5, 1, 0)} LayoutOrder={3} />
        </frame>
    );
}
