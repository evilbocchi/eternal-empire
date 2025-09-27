/**
 * @fileoverview Challenge completion notification component with epic animations and reward display.
 *
 * Features:
 * - Dramatic sliding entrance animation from top
 * - Glowing text effects with challenge colors
 * - Reward display with animated emphasis
 * - Victory particle effects radiating outward
 * - Sound feedback and screen effects
 * - Triumphant exit animation
 */

import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { RunService, TweenService } from "@rbxts/services";
import { RobotoSlabBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";

export interface ChallengeCompletionData {
    challengeName: string;
    rewardText: string;
    challengeColors: {
        primary: Color3;
        secondary: Color3;
    };
    visible: boolean;
}

interface ChallengeCompletionNotificationProps {
    data: ChallengeCompletionData;
    onComplete: () => void;
}

export default function ChallengeCompletionNotification({ data, onComplete }: ChallengeCompletionNotificationProps) {
    const mainFrameRef = useRef<Frame>();
    const challengeNameRef = useRef<TextLabel>();
    const titleTextRef = useRef<TextLabel>();
    const shineTextRef = useRef<TextLabel>();
    const glowRef = useRef<Frame>();
    const rewardContainerRef = useRef<Frame>();
    const [victoryParticles, setVictoryParticles] = useState<
        Array<{ id: string; angle: number; delay: number; speed: number }>
    >([]);
    const animationStarted = useRef(false);

    // Create victory particle effects
    const createVictoryParticles = () => {
        const particles: Array<{ id: string; angle: number; delay: number; speed: number }> = [];
        for (let i = 0; i < 12; i++) {
            particles.push({
                id: `victory_particle_${i}_${tick()}`,
                angle: (i / 12) * math.pi * 2,
                delay: math.random() * 0.4,
                speed: 0.8 + math.random() * 0.6,
            });
        }
        setVictoryParticles(particles);
    };

    // Animated shine effect for the title text with challenge colors
    const startShineAnimation = () => {
        if (!shineTextRef.current) return;

        const shineText = shineTextRef.current;
        const shineGradient = shineText.FindFirstChild("UIGradient") as UIGradient;

        if (!shineGradient) return;

        let shineConnection: RBXScriptConnection | undefined;
        let time = 0;

        shineConnection = RunService.Heartbeat.Connect((deltaTime) => {
            time += deltaTime * 2;

            const rotation = (time * 150) % 360;
            shineGradient.Rotation = rotation;

            const pulse = (math.sin(time * 3) + 1) / 2;
            const transparency = 0.5 + pulse * 0.4;
            shineText.TextTransparency = transparency;

            if (time > 3) {
                shineConnection?.Disconnect();
                shineText.TextTransparency = 0.9;
            }
        });
    };

    // Main animation sequence
    useEffect(() => {
        if (!data.visible || !mainFrameRef.current || animationStarted.current) return;

        animationStarted.current = true;
        const mainFrame = mainFrameRef.current;
        const challengeName = challengeNameRef.current;
        const rewardContainer = rewardContainerRef.current;
        const glow = glowRef.current;

        // Play challenge completion sound
        playSound("QuestComplete.mp3");

        // Initial setup - start off-screen from top
        mainFrame.Position = new UDim2(0.5, 0, -0.5, 0);
        mainFrame.Size = new UDim2(0, 0, 0, 0);

        // Initialize text elements
        if (titleTextRef.current) {
            const titleFrame = titleTextRef.current.Parent as Frame;
            const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

            textLabels.forEach((label) => {
                label.TextTransparency = 1;
                label.TextStrokeTransparency = 1;
            });
        }

        if (challengeName) {
            challengeName.TextTransparency = 1;
            challengeName.TextStrokeTransparency = 1;
        }

        if (rewardContainer) {
            rewardContainer.BackgroundTransparency = 1;
            const rewardElements = rewardContainer
                .GetDescendants()
                .filter((child) => child.IsA("TextLabel") || child.IsA("ImageLabel"));
            rewardElements.forEach((element) => {
                if (element.IsA("TextLabel")) {
                    element.TextTransparency = 1;
                } else if (element.IsA("ImageLabel")) {
                    element.ImageTransparency = 1;
                }
            });
        }

        if (glow) {
            glow.BackgroundTransparency = 1;
        }

        // Create victory particles
        createVictoryParticles();

        // Phase 1: Epic entrance from top with bounce (0.8s)
        const entranceTween = TweenService.Create(
            mainFrame,
            new TweenInfo(0.8, Enum.EasingStyle.Bounce, Enum.EasingDirection.Out),
            {
                Position: new UDim2(0.5, 0, 0.2, 20), // More spacing from top + offset
                Size: new UDim2(0.35, 0, 0.22, 0), // Slightly smaller for better fit
            },
        );

        // Phase 2: Text and glow dramatic reveal (0.5s, starts 0.4s after entrance)
        const contentReveal = () => {
            if (titleTextRef.current) {
                const titleFrame = titleTextRef.current.Parent as Frame;
                const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

                textLabels.forEach((label) => {
                    TweenService.Create(label, new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
                        TextTransparency: label === shineTextRef.current ? 0.7 : 0,
                        TextStrokeTransparency: 0,
                    }).Play();
                });
            }

            if (challengeName) {
                TweenService.Create(
                    challengeName,
                    new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                    {
                        TextTransparency: 0,
                        TextStrokeTransparency: 0,
                    },
                ).Play();
            }

            if (glow) {
                TweenService.Create(glow, new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
                    BackgroundTransparency: 0.3,
                }).Play();
            }

            // Start epic shine animation
            task.delay(0.5, startShineAnimation);
        };

        // Phase 3: Reward display with emphasis (0.6s, starts 1s after entrance)
        const showRewards = () => {
            if (rewardContainer) {
                TweenService.Create(
                    rewardContainer,
                    new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                    {
                        BackgroundTransparency: 0.1,
                    },
                ).Play();

                const rewardElements = rewardContainer
                    .GetDescendants()
                    .filter((child) => child.IsA("TextLabel") || child.IsA("ImageLabel"));
                rewardElements.forEach((element, index) => {
                    task.delay(index * 0.15, () => {
                        if (element.IsA("TextLabel")) {
                            TweenService.Create(
                                element,
                                new TweenInfo(0.4, Enum.EasingStyle.Elastic, Enum.EasingDirection.Out),
                                {
                                    TextTransparency: 0,
                                },
                            ).Play();
                        } else if (element.IsA("ImageLabel")) {
                            TweenService.Create(
                                element,
                                new TweenInfo(0.4, Enum.EasingStyle.Elastic, Enum.EasingDirection.Out),
                                {
                                    ImageTransparency: 0,
                                },
                            ).Play();
                        }
                    });
                });
            }
        };

        // Phase 4: Pulsing challenge-colored glow effect (continuous for 2.5s)
        const startGlowPulse = () => {
            if (!glow) return;

            let pulseConnection: RBXScriptConnection | undefined;
            let time = 0;

            pulseConnection = RunService.Heartbeat.Connect((deltaTime) => {
                time += deltaTime;
                if (time > 2.5) {
                    pulseConnection?.Disconnect();
                    return;
                }

                const pulse = (math.sin(time * 4) + 1) / 2;
                const transparency = 0.1 + pulse * 0.4;

                // Alternate between challenge colors
                const colorLerp = (math.sin(time * 2) + 1) / 2;
                const color = data.challengeColors.primary.Lerp(data.challengeColors.secondary, colorLerp);

                glow.BackgroundTransparency = transparency;
                glow.BackgroundColor3 = color;
            });
        };

        // Phase 5: Triumphant exit animation (0.6s, starts after 5s total)
        const exitAnimation = () => {
            const exitTween = TweenService.Create(
                mainFrame,
                new TweenInfo(0.6, Enum.EasingStyle.Back, Enum.EasingDirection.In),
                {
                    Position: new UDim2(0.5, 0, -0.5, 0),
                    Size: new UDim2(0.2, 0, 0.1, 0),
                },
            );

            // Fade out all elements with stagger
            if (titleTextRef.current) {
                const titleFrame = titleTextRef.current.Parent as Frame;
                const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

                textLabels.forEach((label, index) => {
                    task.delay(index * 0.1, () => {
                        TweenService.Create(label, new TweenInfo(0.6), {
                            TextTransparency: 1,
                            TextStrokeTransparency: 1,
                        }).Play();
                    });
                });
            }

            if (challengeName) {
                TweenService.Create(challengeName, new TweenInfo(0.6), {
                    TextTransparency: 1,
                    TextStrokeTransparency: 1,
                }).Play();
            }

            if (rewardContainer) {
                TweenService.Create(rewardContainer, new TweenInfo(0.6), {
                    BackgroundTransparency: 1,
                }).Play();

                const rewardElements = rewardContainer
                    .GetDescendants()
                    .filter((child) => child.IsA("TextLabel") || child.IsA("ImageLabel"));
                rewardElements.forEach((element, index) => {
                    task.delay(index * 0.05, () => {
                        if (element.IsA("TextLabel")) {
                            TweenService.Create(element, new TweenInfo(0.6), {
                                TextTransparency: 1,
                            }).Play();
                        } else if (element.IsA("ImageLabel")) {
                            TweenService.Create(element, new TweenInfo(0.6), {
                                ImageTransparency: 1,
                            }).Play();
                        }
                    });
                });
            }

            if (glow) {
                TweenService.Create(glow, new TweenInfo(0.6), {
                    BackgroundTransparency: 1,
                }).Play();
            }

            exitTween.Play();
            exitTween.Completed.Connect(() => {
                setVictoryParticles([]);
                onComplete();
            });
        };

        // Execute animation sequence
        entranceTween.Play();
        task.delay(0.4, contentReveal);
        task.delay(1, showRewards);
        task.delay(1.2, startGlowPulse);
        task.delay(5, exitAnimation);

        return () => {
            animationStarted.current = false;
        };
    }, [data.visible, data.challengeName, data.challengeColors, data.rewardText, onComplete]);

    if (!data.visible) {
        return <Fragment />;
    }

    return (
        <frame ref={mainFrameRef} AnchorPoint={new Vector2(0.5, 0.5)} BackgroundTransparency={1} ZIndex={10}>
            {/* Size constraints - more conservative for smaller screens */}
            <uisizeconstraint MaxSize={new Vector2(500, 300)} MinSize={new Vector2(280, 120)} />

            {/* Epic background glow effect */}
            <frame
                ref={glowRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={data.challengeColors.primary}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(1, 30, 1, 30)}
                ZIndex={-1}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, data.challengeColors.primary),
                            new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, data.challengeColors.secondary),
                        ])
                    }
                    Rotation={45}
                />
                <uistroke Color={data.challengeColors.secondary} Thickness={2} />
            </frame>

            {/* Main content background */}
            <frame
                BackgroundColor3={Color3.fromRGB(25, 25, 35)}
                BorderColor3={data.challengeColors.primary}
                BorderSizePixel={3}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(45, 45, 55)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(15, 15, 25)),
                        ])
                    }
                    Rotation={135}
                />
                <uistroke Color={data.challengeColors.secondary} Thickness={2} />
                <uipadding
                    PaddingBottom={new UDim(0, 15)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 15)}
                />

                {/* "CHALLENGE CONQUERED!" title with epic 3D effects */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.4, 0)} ZIndex={2}>
                    {/* 3D Shadow layer */}
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 3, 0, 3)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="CHALLENGE CONQUERED!"
                        TextColor3={Color3.fromRGB(10, 10, 10)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0.2}
                        TextTransparency={0.3}
                        ZIndex={1}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    {/* Main text layer */}
                    <textlabel
                        ref={titleTextRef}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="CHALLENGE CONQUERED!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0}
                        ZIndex={2}
                    >
                        <uistroke Thickness={3} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.5, data.challengeColors.primary),
                                    new ColorSequenceKeypoint(1, data.challengeColors.secondary),
                                ])
                            }
                            Rotation={-45}
                        />
                    </textlabel>

                    {/* Epic shine overlay */}
                    <textlabel
                        ref={shineTextRef}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="CHALLENGE CONQUERED!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextTransparency={0.7}
                        ZIndex={3}
                    >
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                                ])
                            }
                            Transparency={
                                new NumberSequence([
                                    new NumberSequenceKeypoint(0, 1),
                                    new NumberSequenceKeypoint(0.3, 1),
                                    new NumberSequenceKeypoint(0.5, 0.1),
                                    new NumberSequenceKeypoint(0.7, 1),
                                    new NumberSequenceKeypoint(1, 1),
                                ])
                            }
                            Rotation={60}
                        />
                    </textlabel>
                </frame>

                {/* Challenge name */}
                <textlabel
                    ref={challengeNameRef}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0, 0, 0.4, 0)}
                    Size={new UDim2(1, 0, 0.25, 0)}
                    Text={data.challengeName}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                    TextStrokeTransparency={0}
                    ZIndex={2}
                >
                    <uistroke Thickness={2} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, data.challengeColors.primary),
                                new ColorSequenceKeypoint(1, data.challengeColors.secondary),
                            ])
                        }
                        Rotation={90}
                    />
                </textlabel>

                {/* Reward display */}
                <frame
                    ref={rewardContainerRef}
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundColor3={Color3.fromRGB(5, 5, 15)}
                    BackgroundTransparency={0.1}
                    BorderSizePixel={0}
                    LayoutOrder={3}
                    Position={new UDim2(0.5, 0, 0.7, 0)}
                    Size={new UDim2(0.95, 0, 0.25, 0)}
                >
                    <uistroke Color={data.challengeColors.primary} Thickness={2} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, data.challengeColors.primary),
                                new ColorSequenceKeypoint(1, data.challengeColors.secondary),
                            ])
                        }
                        Rotation={180}
                        Transparency={
                            new NumberSequence([new NumberSequenceKeypoint(0, 0.8), new NumberSequenceKeypoint(1, 0.9)])
                        }
                    />

                    <textlabel
                        AnchorPoint={new Vector2(0, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Text="Rewards"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        Position={new UDim2(0, 8, 0, 0)}
                        Size={new UDim2(0.2, 0, 1, 0)}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    <textlabel
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.75, 0, 0.8, 0)}
                        Text={data.rewardText}
                        TextColor3={Color3.fromRGB(255, 215, 0)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        ZIndex={2}
                    >
                        <uistroke Thickness={2} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 100)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 215, 0)),
                                ])
                            }
                            Rotation={45}
                        />
                    </textlabel>
                </frame>
            </frame>

            {/* Victory particle effects */}
            {victoryParticles.map((particle) => (
                <VictoryParticle
                    key={particle.id}
                    angle={particle.angle}
                    delay={particle.delay}
                    speed={particle.speed}
                    color={data.challengeColors.primary}
                />
            ))}
        </frame>
    );
}

// Individual victory particle component
function VictoryParticle({
    angle,
    delay,
    speed,
    color,
}: {
    angle: number;
    delay: number;
    speed: number;
    color: Color3;
}) {
    const particleRef = useRef<ImageLabel>();

    useEffect(() => {
        if (!particleRef.current) return;

        const particle = particleRef.current;

        // Calculate initial position
        const centerX = 0.5;
        const centerY = 0.5;
        const distance = 80;
        const initialX = centerX + (math.cos(angle) * distance) / 600;
        const initialY = centerY + (math.sin(angle) * distance) / 400;

        particle.Position = new UDim2(initialX, 0, initialY, 0);
        particle.ImageTransparency = 1;
        particle.Size = new UDim2(0, 16, 0, 16);
        particle.ImageColor3 = color;

        // Delayed animation start
        task.delay(delay, () => {
            if (!particle.Parent) return;

            particle.ImageTransparency = 0;

            // Animate epic outward burst
            const burstTween = TweenService.Create(
                particle,
                new TweenInfo(2 * speed, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {
                    Position: new UDim2(
                        initialX + (math.cos(angle) * 150 * speed) / 600,
                        0,
                        initialY + (math.sin(angle) * 150 * speed) / 400,
                        0,
                    ),
                    ImageTransparency: 1,
                    Size: new UDim2(0, 8, 0, 8),
                    Rotation: 360,
                },
            );

            // Add sparkle effect
            const sparkleTween = TweenService.Create(
                particle,
                new TweenInfo(0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 4),
                {
                    Size: new UDim2(0, 20, 0, 20),
                },
            );

            burstTween.Play();
            sparkleTween.Play();
        });

        return () => {
            if (particle.Parent) {
                TweenService.Create(particle, new TweenInfo(0.1), { ImageTransparency: 1 }).Play();
            }
        };
    }, [angle, delay, speed, color]);

    return (
        <imagelabel
            ref={particleRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Image={getAsset("assets/Spark.png")}
            Size={new UDim2(0, 16, 0, 16)}
            ZIndex={8}
        />
    );
}
