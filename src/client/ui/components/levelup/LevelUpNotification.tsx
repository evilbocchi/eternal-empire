/**
 * @fileoverview Level up notification component with cool animations and effects.
 *
 * Features:
 * - Sliding entrance animation from top
 * - Glowing text effects with color animations
 * - Scale and rotation animations
 * - Particle-like spark effects
 * - Sound feedback
 * - Smooth exit animation
 */

import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { RunService, TweenService } from "@rbxts/services";
import { RobotoSlabBold, RobotoSlabHeavy } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";

export interface LevelUpData {
    level: number;
    visible: boolean;
}

interface LevelUpNotificationProps {
    data: LevelUpData;
    onComplete: () => void;
}

export default function LevelUpNotification({ data, onComplete }: LevelUpNotificationProps) {
    const mainFrameRef = useRef<Frame>();
    const levelTextRef = useRef<TextLabel>();
    const titleTextRef = useRef<TextLabel>();
    const shineTextRef = useRef<TextLabel>();
    const glowRef = useRef<Frame>();
    const [sparks, setSparks] = useState<
        Array<{ id: string; angle: number; distance: number; delay: number; velocity: number }>
    >([]);
    const animationStarted = useRef(false);

    // Create sparkle effects around the notification
    const createSparks = () => {
        const sparkArray: Array<{ id: string; angle: number; distance: number; delay: number; velocity: number }> = [];
        for (let i = 0; i < 12; i++) {
            sparkArray.push({
                id: `spark_${i}_${tick()}`,
                angle: (i / 12) * math.pi * 2,
                distance: 120 + math.random() * 40,
                delay: math.random() * 0.5, // Staggered animation
                velocity: 100 + math.random() * 100, // Random initial velocity
            });
        }
        setSparks(sparkArray);
    };

    // Animated shine effect for the title text
    const startShineAnimation = () => {
        if (!shineTextRef.current) return;

        const shineText = shineTextRef.current;
        const shineGradient = shineText.FindFirstChild("UIGradient") as UIGradient;

        if (!shineGradient) return;

        // Create continuous shine sweep animation
        let shineConnection: RBXScriptConnection | undefined;
        let time = 0;

        shineConnection = RunService.Heartbeat.Connect((deltaTime) => {
            time += deltaTime * 2; // Speed up the animation

            // Create moving shine effect by rotating the gradient
            const rotation = (time * 180) % 360;
            shineGradient.Rotation = rotation;

            // Pulse the shine intensity
            const pulse = (math.sin(time * 3) + 1) / 2; // 0 to 1
            const transparency = 0.5 + pulse * 0.4; // 0.5 to 0.9
            shineText.TextTransparency = transparency;

            // Stop after 3 seconds
            if (time > 3) {
                shineConnection?.Disconnect();
                shineText.TextTransparency = 0.8; // Final transparency
            }
        });
    };

    // Main animation sequence
    useEffect(() => {
        if (!data.visible || !mainFrameRef.current || animationStarted.current) return;

        animationStarted.current = true;
        const mainFrame = mainFrameRef.current;
        const levelText = levelTextRef.current;
        const glow = glowRef.current;

        // Play level up sound
        playSound("LevelUp.mp3");

        // Initial setup - start off-screen
        mainFrame.Position = new UDim2(0.5, 0, -0.2, 0);
        mainFrame.Size = new UDim2(0, 0, 0, 0);
        if (levelText) {
            levelText.TextTransparency = 1;
            levelText.TextStrokeTransparency = 1;
        }
        if (titleTextRef.current) {
            // Hide all title text layers initially
            const titleFrame = titleTextRef.current.Parent as Frame;
            const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

            textLabels.forEach((label) => {
                label.TextTransparency = 1;
                label.TextStrokeTransparency = 1;
            });
        }
        if (glow) {
            glow.BackgroundTransparency = 1;
        }

        // Create sparks
        createSparks();

        // Phase 1: Dramatic entrance (0.5s)
        const entranceTween = TweenService.Create(
            mainFrame,
            new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
            {
                Position: new UDim2(0.5, 0, 0.3, 0),
                Size: new UDim2(0.6, 0, 0.12, 0), // Responsive sizing: 60% width, 12% height
            },
        );

        // Phase 2: Text fade in (0.3s, starts 0.2s after entrance)
        const textFadeIn = () => {
            if (titleTextRef.current) {
                // Fade in all title text layers
                const titleFrame = titleTextRef.current.Parent as Frame;
                const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

                textLabels.forEach((label) => {
                    TweenService.Create(label, new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                        TextTransparency: label === shineTextRef.current ? 0.7 : 0,
                        TextStrokeTransparency: 0,
                    }).Play();
                });
            }

            if (levelText) {
                TweenService.Create(levelText, new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                    TextTransparency: 0,
                    TextStrokeTransparency: 0,
                }).Play();
            }

            if (glow) {
                TweenService.Create(glow, new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                    BackgroundTransparency: 0.3,
                }).Play();
            }

            // Start animated shine effect after text appears
            task.delay(0.3, () => {
                startShineAnimation();
            });
        };

        // Phase 3: Pulsing glow effect with color cycling (continuous for 2s)
        const startGlowPulse = () => {
            if (!glow) return;

            let pulseConnection: RBXScriptConnection | undefined;
            let time = 0;

            pulseConnection = RunService.Heartbeat.Connect((deltaTime) => {
                time += deltaTime;
                if (time > 2) {
                    pulseConnection?.Disconnect();
                    return;
                }

                const pulse = (math.sin(time * 8) + 1) / 2; // 0 to 1
                const transparency = 0.1 + pulse * 0.4; // 0.1 to 0.5

                // Color cycling for extra effect
                const colorCycle = (math.sin(time * 4) + 1) / 2;
                const color = Color3.fromRGB(
                    255,
                    math.floor(223 + colorCycle * 32), // 223 to 255
                    math.floor(62 + colorCycle * 193), // 62 to 255
                );

                glow.BackgroundTransparency = transparency;
                glow.BackgroundColor3 = color;
            });
        };

        // Phase 4: Exit animation (0.4s, starts after 2.5s total)
        const exitAnimation = () => {
            const exitTween = TweenService.Create(
                mainFrame,
                new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                {
                    Position: new UDim2(0.5, 0, -0.2, 0),
                    Size: new UDim2(0.3, 0, 0.06, 0), // Shrink to half size for exit
                },
            );

            // Fade out all elements
            if (levelText) {
                TweenService.Create(levelText, new TweenInfo(0.4), {
                    TextTransparency: 1,
                    TextStrokeTransparency: 1,
                }).Play();
            }

            if (titleTextRef.current) {
                // Fade out all title text layers
                const titleFrame = titleTextRef.current.Parent as Frame;
                const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

                textLabels.forEach((label) => {
                    TweenService.Create(label, new TweenInfo(0.4), {
                        TextTransparency: 1,
                        TextStrokeTransparency: 1,
                    }).Play();
                });
            }

            if (glow) {
                TweenService.Create(glow, new TweenInfo(0.4), {
                    BackgroundTransparency: 1,
                }).Play();
            }

            exitTween.Play();
            exitTween.Completed.Connect(() => {
                setSparks([]);
                onComplete();
            });
        };

        // Execute animation sequence
        entranceTween.Play();
        task.delay(0.2, textFadeIn);
        task.delay(0.5, startGlowPulse);
        task.delay(2.5, exitAnimation);

        return () => {
            animationStarted.current = false;
        };
    }, [data.visible, data.level, onComplete]);

    if (!data.visible) {
        return <Fragment />;
    }

    return (
        <frame
            ref={mainFrameRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.3, 0)}
            Size={new UDim2(0.6, 0, 0.12, 0)} // Responsive sizing: 60% width, 12% height
            ZIndex={3}
        >
            {/* Size constraints for very small/large screens */}
            <uisizeconstraint
                MaxSize={new Vector2(600, 150)} // Maximum size for large screens
                MinSize={new Vector2(300, 80)} // Minimum size for small screens
            />
            {/* Background glow effect */}
            <frame
                ref={glowRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(255, 223, 62)}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(1, 30, 1, 30)}
                ZIndex={-1}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 223, 62)),
                            new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 223, 62)),
                        ])
                    }
                    Rotation={45}
                />
            </frame>

            {/* Main content background */}
            <frame
                BackgroundColor3={Color3.fromRGB(45, 45, 45)}
                BorderColor3={Color3.fromRGB(255, 223, 62)}
                BorderSizePixel={3}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(105, 105, 105)),
                        ])
                    }
                    Rotation={90}
                />
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={2} />

                {/* "LEVEL UP!" title with 3D and shiny effects */}
                <frame
                    BackgroundTransparency={1}
                    Position={new UDim2(0, 0, 0, 0)}
                    Size={new UDim2(1, 0, 0.6, 0)}
                    ZIndex={2}
                >
                    {/* 3D Shadow layer (back) */}
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 4, 0, 4)} // Offset for 3D effect
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="LEVEL UP!"
                        TextColor3={Color3.fromRGB(20, 20, 20)} // Dark shadow
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0.3}
                        TextTransparency={0.4}
                        ZIndex={1}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    {/* Middle 3D layer */}
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 2, 0, 2)} // Slight offset
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="LEVEL UP!"
                        TextColor3={Color3.fromRGB(180, 140, 30)} // Darker gold
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(40, 30, 10)}
                        TextStrokeTransparency={0}
                        TextTransparency={0.2}
                        ZIndex={2}
                    >
                        <uistroke Thickness={3} />
                    </textlabel>

                    {/* Main text layer with gradient */}
                    <textlabel
                        ref={titleTextRef}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="LEVEL UP!"
                        TextColor3={Color3.fromRGB(255, 223, 62)} // Bright gold
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(120, 60, 10)}
                        TextStrokeTransparency={0}
                        ZIndex={3}
                    >
                        <uistroke Thickness={4} />
                        {/* Gradient overlay for shiny effect */}
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), // White highlight
                                    new ColorSequenceKeypoint(0.3, Color3.fromRGB(255, 223, 62)), // Gold
                                    new ColorSequenceKeypoint(0.7, Color3.fromRGB(255, 180, 0)), // Orange-gold
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(200, 160, 40)), // Darker gold
                                ])
                            }
                            Rotation={-45} // Diagonal gradient for shine effect
                        />
                    </textlabel>

                    {/* Shine overlay that will animate */}
                    <textlabel
                        ref={shineTextRef}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="LEVEL UP!"
                        TextColor3={Color3.fromRGB(255, 255, 255)} // Pure white shine
                        TextScaled={true}
                        TextTransparency={0.8} // Start mostly transparent
                        ZIndex={4}
                    >
                        {/* Moving shine gradient */}
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.2, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.4, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.6, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                ])
                            }
                            Transparency={
                                new NumberSequence([
                                    new NumberSequenceKeypoint(0, 1), // Transparent
                                    new NumberSequenceKeypoint(0.3, 1), // Transparent
                                    new NumberSequenceKeypoint(0.5, 0.2), // Visible shine
                                    new NumberSequenceKeypoint(0.7, 1), // Transparent
                                    new NumberSequenceKeypoint(1, 1), // Transparent
                                ])
                            }
                            Rotation={45}
                        />
                    </textlabel>
                </frame>

                {/* Level number */}
                <textlabel
                    ref={levelTextRef}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0, 0, 0.6, 0)}
                    Size={new UDim2(1, 0, 0.325, 0)}
                    Text={`Your empire has reached Level ${data.level}.`}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                    TextStrokeTransparency={0}
                    ZIndex={2}
                >
                    <uistroke Thickness={2} />
                </textlabel>
            </frame>

            {/* Spark effects around the notification */}
            {sparks.map((spark) => (
                <SparkEffect
                    key={spark.id}
                    angle={spark.angle}
                    distance={spark.distance}
                    delay={spark.delay}
                    velocity={spark.velocity}
                />
            ))}
        </frame>
    );
}

// Individual spark effect component with gravity
function SparkEffect({
    angle,
    distance,
    delay,
    velocity,
}: {
    angle: number;
    distance: number;
    delay: number;
    velocity: number;
}) {
    const sparkRef = useRef<ImageLabel>();

    useEffect(() => {
        if (!sparkRef.current) return;

        const spark = sparkRef.current;

        // Calculate initial position around the main frame
        const centerX = 0.5;
        const centerY = 0.5;
        const initialX = centerX + (math.cos(angle) * distance) / 1000; // Adjusted for responsive sizing
        const initialY = centerY + (math.sin(angle) * distance) / 300; // Adjusted for responsive sizing

        // Physics properties
        let positionX = initialX;
        let positionY = initialY;
        let velocityX = (math.cos(angle) * velocity) / 1000; // Adjusted scale for responsive sizing
        let velocityY = (math.sin(angle) * velocity) / 300 - 200 / 300; // Adjusted scale for responsive sizing
        const gravity = 600 / 300; // Gravity acceleration (downward) - adjusted for responsive sizing
        const damping = 0.98; // Air resistance

        let time = 0;
        let animationConnection: RBXScriptConnection | undefined;

        spark.Position = new UDim2(positionX, 0, positionY, 0);
        spark.ImageTransparency = 1; // Start invisible
        spark.Size = new UDim2(0, 15, 0, 15);

        // Delayed animation start
        task.delay(delay, () => {
            if (!spark.Parent) return;

            spark.ImageTransparency = 0;

            // Start physics simulation
            animationConnection = RunService.Heartbeat.Connect((deltaTime) => {
                if (!spark.Parent) {
                    animationConnection?.Disconnect();
                    return;
                }

                time += deltaTime;

                // Apply gravity to vertical velocity
                velocityY += gravity * deltaTime;

                // Apply damping to horizontal velocity
                velocityX *= damping;

                // Update position
                positionX += velocityX * deltaTime;
                positionY += velocityY * deltaTime;

                // Update spark position
                spark.Position = new UDim2(positionX, 0, positionY, 0);

                // Rotate the spark as it falls
                spark.Rotation = time * 180;

                // Fade out over time and shrink
                const fadeTime = math.min(time / 2.5, 1); // Fade over 2.5 seconds
                spark.ImageTransparency = fadeTime;

                const scale = math.max(1 - fadeTime * 0.6, 0.4); // Shrink to 40% of original size
                spark.Size = new UDim2(0, 15 * scale, 0, 15 * scale);

                // Remove spark when it's too low or completely faded
                if (positionY > 1.5 || fadeTime >= 1) {
                    animationConnection?.Disconnect();
                    if (spark.Parent) {
                        spark.Parent = undefined;
                    }
                }
            });
        });

        return () => {
            // Cleanup when component unmounts
            animationConnection?.Disconnect();
            if (spark.Parent) {
                TweenService.Create(spark, new TweenInfo(0.1), { ImageTransparency: 1 }).Play();
            }
        };
    }, [angle, distance, delay, velocity]);
    return (
        <imagelabel
            ref={sparkRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Image={getAsset("assets/Spark.png")}
            ImageColor3={Color3.fromRGB(255, 255, 255)}
            Size={new UDim2(0, 15, 0, 15)}
            ZIndex={3}
        />
    );
}
