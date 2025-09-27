import React, { useCallback, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { RobotoSlabBold } from "shared/asset/GameFonts";

interface PurchaseButtonProps {
    text: string;
    price: string;
    currency: "robux" | "funds";
    onClick: () => void;
    disabled?: boolean;
}

/**
 * Purchase button component for Robux or Funds payments with modern styling
 */
export default function PurchaseButton({ text, price, currency, onClick, disabled = false }: PurchaseButtonProps) {
    const buttonRef = useRef<TextButton>();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseEnter = useCallback(() => {
        if (disabled) return;
        setIsHovered(true);
        const button = buttonRef.current;
        if (button) {
            const tween = TweenService.Create(button, new TweenInfo(0.2, Enum.EasingStyle.Quad), {
                Size: new UDim2(0.42, 4, 1, 4),
            });
            tween.Play();
        }
    }, [disabled]);

    const handleMouseLeave = useCallback(() => {
        if (disabled) return;
        setIsHovered(false);
        setIsPressed(false);
        const button = buttonRef.current;
        if (button) {
            const tween = TweenService.Create(button, new TweenInfo(0.2, Enum.EasingStyle.Quad), {
                Size: new UDim2(0.42, 0, 1, 0),
            });
            tween.Play();
        }
    }, [disabled]);

    const handleMouseButton1Down = useCallback(() => {
        if (disabled) return;
        setIsPressed(true);
    }, [disabled]);

    const handleMouseButton1Up = useCallback(() => {
        if (disabled) return;
        setIsPressed(false);
    }, [disabled]);

    const handleActivated = useCallback(() => {
        if (disabled) return;
        onClick();
    }, [disabled, onClick]);

    // Color scheme based on currency type
    const isRobux = currency === "robux";
    const gradientColors = isRobux
        ? [Color3.fromRGB(40, 180, 40), Color3.fromRGB(20, 140, 20)] // Enhanced green for Robux
        : [Color3.fromRGB(100, 150, 255), Color3.fromRGB(60, 110, 200)]; // Blue for Funds

    const strokeColor = isRobux ? Color3.fromRGB(80, 220, 80) : Color3.fromRGB(120, 170, 255);
    const shadowColor = isRobux ? Color3.fromRGB(15, 80, 15) : Color3.fromRGB(30, 60, 120);

    return (
        <textbutton
            ref={buttonRef}
            BackgroundColor3={Color3.fromRGB(255, 255, 255)}
            BackgroundTransparency={disabled ? 0.6 : 0}
            BorderSizePixel={0}
            Size={new UDim2(0.42, 0, 1, 0)}
            Text=""
            TextColor3={Color3.fromRGB(0, 0, 0)}
            TextSize={14}
            AutoButtonColor={false}
            Event={{
                MouseEnter: handleMouseEnter,
                MouseLeave: handleMouseLeave,
                MouseButton1Down: handleMouseButton1Down,
                MouseButton1Up: handleMouseButton1Up,
                Activated: handleActivated,
            }}
        >
            <uicorner CornerRadius={new UDim(0, 12)} />
            <uistroke
                Color={strokeColor}
                Thickness={2}
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Transparency={disabled ? 0.6 : 0}
            />

            {/* Shadow effect */}
            <frame
                BackgroundColor3={shadowColor}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Position={new UDim2(0, 2, 0, 2)}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-1}
            >
                <uicorner CornerRadius={new UDim(0, 12)} />
            </frame>

            {/* Gradient background */}
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, gradientColors[0]),
                        new ColorSequenceKeypoint(1, gradientColors[1]),
                    ])
                }
                Rotation={90}
                Transparency={disabled ? new NumberSequence(0.5) : new NumberSequence(0)}
            />

            {/* Shine effect for hover */}
            {isHovered && !disabled && (
                <frame
                    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                    BackgroundTransparency={0.7}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0.3, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                    <uigradient
                        Color={new ColorSequence(Color3.fromRGB(255, 255, 255))}
                        Rotation={90}
                        Transparency={
                            new NumberSequence([new NumberSequenceKeypoint(0, 0.3), new NumberSequenceKeypoint(1, 1)])
                        }
                    />
                </frame>
            )}

            {/* Button text */}
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.85, 0, 0.8, 0)}
                Text={price}
                TextColor3={disabled ? Color3.fromRGB(160, 160, 160) : Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={16}
                TextWrapped={true}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} Transparency={disabled ? 0.5 : 0} />
            </textlabel>

            {/* Pressed effect overlay */}
            {isPressed && !disabled && (
                <frame
                    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                    BackgroundTransparency={0.4}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 1, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                </frame>
            )}
        </textbutton>
    );
}
