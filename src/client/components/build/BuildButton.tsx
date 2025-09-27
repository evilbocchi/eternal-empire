/**
 * @fileoverview Reusable build button component for the build system
 *
 * A styled button component that matches the build window design with smooth animations,
 * hover effects, and scaling transitions.
 */

import React, { useCallback, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import BuildManager from "client/components/build/BuildManager";
import { RobotoSlabMedium } from "shared/asset/GameFonts";

interface BuildButtonProps {
    /** Button anchor point */
    anchorPoint?: Vector2;
    /** Button text label */
    text: string;
    /** Optional icon asset ID */
    icon?: string;
    /** Icon color (defaults to white with blue gradient) */
    iconColor?: Color3;
    /** Button layout order */
    layoutOrder?: number;
    /** Whether the button is currently visible */
    visible?: boolean;
    /** Click event handler */
    onClick?: () => void;
    /** Button position */
    position?: UDim2;
    /** Button size (defaults to standard build button size) */
    size?: UDim2;
    /** Custom background color */
    backgroundColor?: Color3;
    /** Whether the button is in a disabled state */
    disabled?: boolean;
}

const DEFAULT_BACKGROUND_COLOR = Color3.fromRGB(102, 102, 102);
const HOVER_COLOR_LERP = 0.1;
const SCALE_TWEEN_INFO = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

/**
 * Styled button component for the build system with animations and hover effects
 */
export default function BuildButton({
    anchorPoint,
    text,
    icon,
    iconColor = Color3.fromRGB(255, 255, 255),
    layoutOrder,
    visible = true,
    onClick,
    position,
    size = new UDim2(0.5, 0, 1, 0),
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    disabled = false,
}: BuildButtonProps) {
    anchorPoint ??= icon ? new Vector2(0, 1) : new Vector2(1, 1);
    position ??= icon ? new UDim2(0, 0, 1, 0) : new UDim2(1, 0, 1, 0);
    const buttonRef = useRef<TextButton>();
    const scaleRef = useRef<UIScale>();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const animationsEnabled = BuildManager.animationsEnabled;

    const handleClick = useCallback(() => {
        if (disabled || !onClick) return;

        if (animationsEnabled) {
            const scale = scaleRef.current;
            if (scale) {
                // Quick press animation
                scale.Scale = 0.9;
                TweenService.Create(scale, SCALE_TWEEN_INFO, { Scale: 1 }).Play();
            }
        }

        onClick();
    }, [disabled, onClick, animationsEnabled]);

    const handleMouseEnter = useCallback(() => {
        if (disabled) return;
        setIsHovered(true);
    }, [disabled]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setIsPressed(false);
    }, []);

    const handleMouseDown = useCallback(() => {
        if (disabled) return;
        setIsPressed(true);
    }, [disabled]);

    const handleMouseUp = useCallback(() => {
        setIsPressed(false);
    }, []);

    // Calculate button color based on state
    const currentBackgroundColor = disabled
        ? backgroundColor.Lerp(Color3.fromRGB(0, 0, 0), 0.5)
        : isPressed
          ? backgroundColor.Lerp(Color3.fromRGB(0, 0, 0), 0.2)
          : isHovered
            ? backgroundColor.Lerp(Color3.fromRGB(255, 255, 255), HOVER_COLOR_LERP)
            : backgroundColor;

    return (
        <textbutton
            ref={buttonRef}
            AnchorPoint={anchorPoint}
            BackgroundColor3={currentBackgroundColor}
            BorderColor3={Color3.fromRGB(27, 42, 53)}
            ClipsDescendants={true}
            LayoutOrder={layoutOrder}
            Position={position}
            Selectable={false}
            Size={size}
            Text=""
            Visible={visible}
            AutoButtonColor={false}
            Event={{
                Activated: handleClick,
                MouseEnter: handleMouseEnter,
                MouseLeave: handleMouseLeave,
                MouseButton1Down: handleMouseDown,
                MouseButton1Up: handleMouseUp,
            }}
        >
            <uicorner CornerRadius={new UDim(0, 4)} />
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={disabled ? Color3.fromRGB(40, 40, 40) : Color3.fromRGB(77, 77, 77)}
            />
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                    ])
                }
                Rotation={270}
            />

            {icon ? (
                <imagelabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={icon}
                    ImageColor3={disabled ? iconColor.Lerp(Color3.fromRGB(0, 0, 0), 0.5) : iconColor}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(0.7, 0, 0.7, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(175, 199, 255)),
                            ])
                        }
                        Rotation={90}
                    />
                </imagelabel>
            ) : undefined}

            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Size={icon ? new UDim2(0, 0, 0.55, 0) : new UDim2(1, 0, 1, 0)}
                Position={icon ? new UDim2(0, 0, 0, 0) : new UDim2(0, 0, 0, 0)}
                Text={text}
                TextColor3={disabled ? Color3.fromRGB(120, 120, 120) : Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uipadding PaddingLeft={new UDim(0, 10)} />
            </textlabel>

            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Padding */}
            {icon ? undefined : (
                <uipadding
                    PaddingBottom={new UDim(0, 5)}
                    PaddingLeft={new UDim(0, 5)}
                    PaddingRight={new UDim(0, 5)}
                    PaddingTop={new UDim(0, 5)}
                />
            )}

            {/* Scale for animations */}
            <uiscale ref={scaleRef} Scale={1} />
        </textbutton>
    );
}
