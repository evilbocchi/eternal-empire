/**
 * @fileoverview React component for sidebar navigation buttons
 * 
 * Modern React implementation of the sidebar buttons system, replacing the
 * monolithic Roblox Studio UI with maintainable React components.
 * 
 * Features:
 * - Individual button components for modularity
 * - State management for visibility and notifications
 * - Smooth animations and transitions
 * - Hotkey integration
 * - Notification badges
 * - Glow effects for active states
 */

import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoSlabBold } from "shared/ui/GameFonts";

interface SidebarButtonProps {
    /** Button configuration data */
    data: SidebarButtonData;
    /** Layout order for positioning */
    layoutOrder: number;
    /** Whether this button is currently active */
    isActive?: boolean;
    /** Click handler */
    onClick: () => void;
    /** Whether animations are enabled */
    animationsEnabled?: boolean;
}

interface SidebarButtonsProps {
    /** Whether the sidebar is visible */
    visible?: boolean;
    /** Callback fired when a button is clicked */
    onButtonClick?: (buttonName: string) => void;
    /** Callback fired when window should be toggled */
    onToggleWindow?: (windowName: string) => boolean;
    /** Current active window name */
    activeWindow?: string;
    /** Position of the sidebar */
    position?: UDim2;
    /** Whether animations are enabled */
    animationsEnabled?: boolean;
    /** Button configurations (optional, will use defaults if not provided) */
    buttons?: SidebarButtonData[];
}

interface SidebarButtonData {
    name: string;
    image: string;
    hotkey?: Enum.KeyCode;
    color: Color3;
    visible: boolean;
    notification?: {
        count: number;
        color: Color3;
    };
    glowColor?: Color3;
}

/**
 * Individual sidebar button component
 */
export function SidebarButton({
    data,
    layoutOrder,
    isActive = false,
    onClick,
    animationsEnabled = true
}: SidebarButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const frameRef = useRef<Frame>();
    const textButtonRef = useRef<TextButton>();

    const animatePress = useCallback(() => {
        if (!animationsEnabled || isAnimating) return;

        setIsAnimating(true);

        // Find the button element to animate
        let buttonElement: GuiObject | undefined;

        if (frameRef.current) {
            buttonElement = frameRef.current.FindFirstChild("Button") as GuiObject | undefined;
        } else if (textButtonRef.current) {
            buttonElement = textButtonRef.current;
        }

        if (!buttonElement) {
            setIsAnimating(false);
            return;
        }

        buttonElement.Size = new UDim2(0.85, 0, 0.85, 0);
        const releaseTween = TweenService.Create(buttonElement, new TweenInfo(0.2), {
            Size: new UDim2(1, 0, 1, 0)
        });
        releaseTween.Play();

        // When release completes, reset animation state
        releaseTween.Completed.Connect(() => {
            setIsAnimating(false);
        });

    }, [animationsEnabled, isAnimating]); const handleClick = useCallback(() => {
        if (animationsEnabled) {
            animatePress();
        }
        onClick();
    }, [onClick, animationsEnabled, animatePress]);

    // Calculate animated size
    const animatedSize = new UDim2(1, 0, 1, 0);    // Special handling for different button types
    return (
        <frame
            key={data.name}
            ref={frameRef}
            BackgroundTransparency={1}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 1, -20)}
            SizeConstraint={Enum.SizeConstraint.RelativeXX}
        >
            <imagebutton
                key="Button"
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutoButtonColor={false}
                BackgroundTransparency={1}
                Image={data.image}
                LayoutOrder={1}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Selectable={false}
                Size={animatedSize}
                Event={{ Activated: handleClick }}
            >
                <uiaspectratioconstraint
                    AspectType={Enum.AspectType.ScaleWithParentSize}
                    DominantAxis={Enum.DominantAxis.Height}
                />
            </imagebutton>

            {/* Glow effect */}
            {data.glowColor && (
                <frame
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundColor3={data.glowColor}
                    BorderSizePixel={0}
                    Position={new UDim2(0, 0, 0.5, 0)}
                    Size={new UDim2(0.25, 0, 0.25, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                    ZIndex={0}
                >
                    <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                    <uicorner CornerRadius={new UDim(0.5, 0)} />
                </frame>
            )}

            {/* Notification badge for Quests */}
            {data.name === "Quests" && data.notification && (
                <frame
                    AnchorPoint={new Vector2(1, 0.5)}
                    AutomaticSize={Enum.AutomaticSize.XY}
                    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                    BorderColor3={Color3.fromRGB(0, 0, 0)}
                    BorderSizePixel={2}
                    LayoutOrder={2}
                    Position={new UDim2(1, -3, 0, 3)}
                >
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, data.notification.color),
                            new ColorSequenceKeypoint(1, data.notification.color.Lerp(Color3.fromRGB(255, 11, 105), 0.5))
                        ])}
                        Rotation={90}
                    />
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Size={new UDim2(0, 0, 0, 16)}
                        Text={tostring(data.notification.count)}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={16}
                        TextWrapped={true}
                    />
                    <uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} />
                    <uistroke Thickness={2} />
                    <uicorner CornerRadius={new UDim(0.5, 0)} />
                </frame>
            )}
        </frame>
    );
}

/**
 * Main sidebar buttons container component
 */
export default function SidebarButtons({
    visible = true,
    onButtonClick,
    onToggleWindow,
    activeWindow,
    position = new UDim2(0, 0, 0.5, 0),
    animationsEnabled = true,
    buttons: providedButtons
}: SidebarButtonsProps) {
    // Sidebar state
    const [isVisible, setIsVisible] = useState(visible);
    const [currentPosition, setCurrentPosition] = useState(position);
    const sidebarRef = useRef<Frame>();

    // Button configurations - use provided buttons or defaults
    const [buttons, setButtons] = useState<SidebarButtonData[]>(providedButtons || [
        {
            name: "Quests",
            image: getAsset("assets/Quests.png"),
            hotkey: Enum.KeyCode.V,
            color: Color3.fromRGB(255, 94, 94),
            visible: true,
            notification: { count: 0, color: Color3.fromRGB(255, 52, 52) },
            glowColor: Color3.fromRGB(255, 94, 94)
        },
        {
            name: "Inventory",
            image: getAsset("assets/Inventory.png"),
            hotkey: Enum.KeyCode.F,
            color: Color3.fromRGB(255, 186, 125),
            visible: true,
            glowColor: Color3.fromRGB(255, 186, 125)
        },
        {
            name: "Stats",
            image: "rbxassetid://8587689304",
            hotkey: Enum.KeyCode.M,
            color: Color3.fromRGB(102, 102, 102),
            visible: false
        },
        {
            name: "Warp",
            image: "rbxassetid://116744052956443",
            hotkey: Enum.KeyCode.G,
            color: Color3.fromRGB(255, 170, 255),
            visible: false
        }
    ]);

    // Handle visibility changes
    useEffect(() => {
        setIsVisible(visible);
        if (animationsEnabled && sidebarRef.current) {
            const targetPosition = visible ? position : new UDim2(-0.015, -50, 0.5, 0);

            // Create TweenInfo for sidebar slide animation
            const slideInfo = new TweenInfo(
                0.3, // Duration: 300ms
                Enum.EasingStyle.Quart,
                Enum.EasingDirection.Out,
                0, // Repeat count
                false, // Reverses
                0 // Delay
            );

            // Create and play the tween
            const slideTween = TweenService.Create(sidebarRef.current, slideInfo, {
                Position: targetPosition
            });

            slideTween.Play();

            // Update current position when tween completes
            slideTween.Completed.Connect(() => {
                setCurrentPosition(targetPosition);
            });
        } else {
            // If animations are disabled, set position immediately
            const targetPosition = visible ? position : new UDim2(-0.015, -50, 0.5, 0);
            setCurrentPosition(targetPosition);
        }
    }, [visible, position, animationsEnabled]);

    // Button click handler
    const handleButtonClick = useCallback((buttonName: string) => {
        if (onButtonClick) {
            onButtonClick(buttonName);
        }

        if (onToggleWindow) {
            const result = onToggleWindow(buttonName);
            if (result)
                playSound("MenuOpen.mp3");
            else
                playSound("MenuClose.mp3");
        }
    }, [onButtonClick, onToggleWindow]);

    // Update button visibility based on game state
    const updateButtonVisibility = useCallback((buttonName: string, visible: boolean) => {
        setButtons(prev => prev.map(button =>
            button.name === buttonName ? { ...button, visible } : button
        ));
    }, []);

    // Update notification count
    const updateNotification = useCallback((buttonName: string, count: number, color?: Color3) => {
        setButtons(prev => prev.map(button =>
            button.name === buttonName
                ? {
                    ...button,
                    notification: count > 0 ? {
                        count,
                        color: color || button.notification?.color || Color3.fromRGB(255, 52, 52)
                    } : undefined
                }
                : button
        ));
    }, []);

    return (
        <frame
            key="SidebarButtons"
            ref={sidebarRef}
            AnchorPoint={new Vector2(0, 0.5)}
            BackgroundTransparency={1}
            Position={currentPosition}
            Size={new UDim2(0.025, 40, 0.5, 0)}
            Visible={isVisible}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0.012, 8)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {buttons.filter(button => button.visible).map((button, index) => (
                <SidebarButton
                    key={button.name}
                    data={button}
                    layoutOrder={index + 1}
                    isActive={activeWindow === button.name}
                    onClick={() => handleButtonClick(button.name)}
                    animationsEnabled={animationsEnabled}
                />
            ))}
        </frame>
    );
}