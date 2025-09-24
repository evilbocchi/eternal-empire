import React, { ReactNode, RefObject, useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { RobotoSlabHeavy } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";

export function BaseMenuOption({
    children,
    gradientColors,
    size,
    onClick,
    animationDelay = 0,
    fast = false,
    labelRef,
}: {
    children: ReactNode;
    gradientColors: [Color3, Color3];
    size: UDim2;
    onClick?: () => void;
    animationDelay?: number;
    fast?: boolean;
    labelRef?: RefObject<TextLabel>;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<ImageButton>();
    const shadowRef = useRef<ImageLabel>();

    // Entrance animation effect
    useEffect(() => {
        const button = buttonRef.current;
        const label = labelRef?.current;
        const shadow = shadowRef.current;
        if (button && shadow) {
            // Set initial off-screen positions
            const originalButtonPos = button.Position;
            const originalShadowPos = shadow.Position;

            button.Position = new UDim2(0, -600, originalButtonPos.Y.Scale, originalButtonPos.Y.Offset);
            shadow.Position = new UDim2(0, -594, originalShadowPos.Y.Scale, originalShadowPos.Y.Offset);
            if (label) {
                label.TextTransparency = 1;
                if (label.FindFirstChild("UIStroke")) {
                    (label.FindFirstChild("UIStroke") as UIStroke).Transparency = 1;
                }
            }

            // Use reduced delays if fast mode is enabled
            const baseDelay = fast ? 0 : 2;
            const animDelay = fast ? animationDelay * 0.1 : animationDelay;

            // Start entrance animation after delay
            task.delay(baseDelay + animDelay, () => {
                if (button && shadow) {
                    const bounce = new TweenInfo(fast ? 0.75 : 1, Enum.EasingStyle.Back, Enum.EasingDirection.Out);

                    TweenService.Create(button, bounce, { Position: originalButtonPos }).Play();
                    TweenService.Create(shadow, bounce, { Position: originalShadowPos }).Play();
                }
                if (label) {
                    TweenService.Create(label, new TweenInfo(fast ? 1 : 1.4), {
                        TextTransparency: 0,
                    }).Play();

                    const stroke = label.FindFirstChild("UIStroke") as UIStroke;
                    if (stroke) {
                        TweenService.Create(stroke, new TweenInfo(fast ? 1 : 1.4), { Transparency: 0 }).Play();
                    }
                }
            });
        }
    }, [animationDelay, fast]);

    const handleMouseEnter = useCallback(() => {
        playSound("EmphasisButtonHover.mp3", undefined, (sound) => (sound.Volume = 0.25));
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <frame Active={true} BackgroundTransparency={1} Size={size}>
            <uiflexitem FlexMode={Enum.UIFlexMode.None} ItemLineAlignment={Enum.ItemLineAlignment.Start} />
            {/* Shadow */}
            <imagelabel
                ref={shadowRef}
                Active={true}
                AnchorPoint={new Vector2(0, 1)}
                BackgroundTransparency={1}
                Image={getAsset("assets/start/MenuOptionBackground.png")}
                ImageColor3={Color3.fromRGB(0, 0, 0)}
                ImageTransparency={0.4}
                Position={new UDim2(0, -100, 1, -7)}
                Size={new UDim2(1, 0, 0.6, -10)}
                ZIndex={-5}
            />

            {/* Main Button */}
            <imagebutton
                ref={buttonRef}
                AnchorPoint={new Vector2(0, 1)}
                AutoButtonColor={false}
                BackgroundTransparency={1}
                Image={getAsset("assets/start/MenuOptionBackground.png")}
                LayoutOrder={1}
                Position={new UDim2(0, -106, 1, -10)}
                Size={new UDim2(1, 0, 0.6, -10)}
                ZIndex={0}
                Event={{
                    Activated: onClick,
                    MouseEnter: handleMouseEnter,
                    MouseLeave: handleMouseLeave,
                }}
            >
                {/* Button Gradient */}
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, gradientColors[0]),
                            new ColorSequenceKeypoint(1, gradientColors[1]),
                        ])
                    }
                    Rotation={90}
                />

                {/* Overlay Pattern */}
                <imagelabel
                    BackgroundTransparency={1}
                    Image={getAsset("assets/start/MenuOptionOverlay.png")}
                    ImageColor3={gradientColors[0]}
                    ImageTransparency={0.9}
                    Interactable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    TileSize={new UDim2(0, 50, 0, 50)}
                />

                {/* Hover Effect */}
                {isHovered && (
                    <imagelabel
                        BackgroundTransparency={1}
                        BorderSizePixel={0}
                        Image={getAsset("assets/start/MenuOptionBackground.png")}
                        ImageTransparency={0.8}
                        Size={new UDim2(1, 0, 1, 0)}
                        ZIndex={2}
                    />
                )}
            </imagebutton>

            {children}
        </frame>
    );
}

/**
 * Reusable menu option component with modern styling and hover effects
 */
export default function MenuOption({
    label,
    gradientColors,
    onClick,
    height,
    animationDelay = 0,
    fast = false,
}: {
    /** Display text for the option */
    label: string;
    /** Gradient colors for the button [start, end] */
    gradientColors: [Color3, Color3];
    /** Click handler */
    onClick: () => void;
    /** Height of the option */
    height: number;
    /** Delay before starting entrance animation (in seconds) */
    animationDelay?: number;
    /** Whether to use fast animations (skip delays) */
    fast?: boolean;
}) {
    const labelRef = useRef<TextLabel>();
    return (
        <BaseMenuOption
            labelRef={labelRef}
            gradientColors={gradientColors}
            size={new UDim2(0.1, 400, 0, height)}
            onClick={onClick}
            animationDelay={animationDelay}
            fast={fast}
        >
            {/* Label */}
            <textlabel
                ref={labelRef}
                Active={true}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Position={new UDim2(0.05, 0, 0, 5)}
                Size={new UDim2(0, 0, 0.8, -10)}
                Text={label}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={60}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke key={"UIStroke"} Thickness={3}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(25, 25, 35)),
                                new ColorSequenceKeypoint(1, gradientColors[0]),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
        </BaseMenuOption>
    );
}
