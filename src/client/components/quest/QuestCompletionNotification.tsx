/**
 * @fileoverview Quest completion notification component with cool animations and reward display.
 *
 * Features:
 * - Sliding entrance animation from right
 * - Glowing text effects with color animations
 * - Reward display (XP, items, areas)
 * - Particle-like celebration effects
 * - Sound feedback
 * - Smooth exit animation
 */

import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { RunService, TweenService } from "@rbxts/services";
import { RobotoSlabBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import { AREAS } from "shared/world/Area";

export interface QuestCompletionData {
    questName: string;
    questColor: Color3;
    reward: Reward;
    visible: boolean;
}

interface QuestCompletionNotificationProps {
    data: QuestCompletionData;
    onComplete: () => void;
}

export default function QuestCompletionNotification({ data, onComplete }: QuestCompletionNotificationProps) {
    const mainFrameRef = useRef<Frame>();
    const questNameRef = useRef<TextLabel>();
    const titleTextRef = useRef<TextLabel>();
    const shineTextRef = useRef<TextLabel>();
    const glowRef = useRef<Frame>();
    const rewardContainerRef = useRef<Frame>();
    const [celebrationParticles, setCelebrationParticles] = useState<
        Array<{ id: string; angle: number; delay: number }>
    >([]);
    const animationStarted = useRef(false);

    // Create celebration particle effects
    const createCelebrationParticles = () => {
        const particles: Array<{ id: string; angle: number; delay: number }> = [];
        for (let i = 0; i < 8; i++) {
            particles.push({
                id: `particle_${i}_${tick()}`,
                angle: (i / 8) * math.pi * 2,
                delay: math.random() * 0.3,
            });
        }
        setCelebrationParticles(particles);
    };

    // Animated shine effect for the title text
    const startShineAnimation = () => {
        if (!shineTextRef.current) return;

        const shineText = shineTextRef.current;
        const shineGradient = shineText.FindFirstChild("UIGradient") as UIGradient;

        if (!shineGradient) return;

        let shineConnection: RBXScriptConnection | undefined;
        let time = 0;

        shineConnection = RunService.Heartbeat.Connect((deltaTime) => {
            time += deltaTime * 1.5;

            const rotation = (time * 120) % 360;
            shineGradient.Rotation = rotation;

            const pulse = (math.sin(time * 2.5) + 1) / 2;
            const transparency = 0.6 + pulse * 0.3;
            shineText.TextTransparency = transparency;

            if (time > 2.5) {
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
        const questName = questNameRef.current;
        const rewardContainer = rewardContainerRef.current;
        const glow = glowRef.current;

        // Play quest completion sound
        playSound("QuestComplete.mp3");

        // Initial setup - start off-screen from bottom
        mainFrame.Position = new UDim2(0.5, 0, 1.2, 0);
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

        if (questName) {
            questName.TextTransparency = 1;
            questName.TextStrokeTransparency = 1;
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

        // Create celebration particles
        createCelebrationParticles();

        // Phase 1: Dramatic entrance from bottom (0.6s)
        const entranceTween = TweenService.Create(
            mainFrame,
            new TweenInfo(0.6, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
            {
                Position: new UDim2(0.5, 0, 0.8, 0), // Centered horizontally, positioned near bottom
                Size: new UDim2(0.3, 0, 0.2, 0), // Responsive sizing
            },
        );

        // Phase 2: Text and glow fade in (0.4s, starts 0.3s after entrance)
        const contentFadeIn = () => {
            if (titleTextRef.current) {
                const titleFrame = titleTextRef.current.Parent as Frame;
                const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

                textLabels.forEach((label) => {
                    TweenService.Create(label, new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                        TextTransparency: label === shineTextRef.current ? 0.8 : 0,
                        TextStrokeTransparency: 0,
                    }).Play();
                });
            }

            if (questName) {
                TweenService.Create(questName, new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                    TextTransparency: 0,
                    TextStrokeTransparency: 0,
                }).Play();
            }

            if (glow) {
                TweenService.Create(glow, new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                    BackgroundTransparency: 0.4,
                }).Play();
            }

            // Start shine animation
            task.delay(0.4, startShineAnimation);
        };

        // Phase 3: Reward display (0.5s, starts 0.8s after entrance)
        const showRewards = () => {
            if (rewardContainer) {
                TweenService.Create(
                    rewardContainer,
                    new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                    {
                        BackgroundTransparency: 0.15,
                    },
                ).Play();

                const rewardElements = rewardContainer
                    .GetDescendants()
                    .filter((child) => child.IsA("TextLabel") || child.IsA("ImageLabel"));
                rewardElements.forEach((element, index) => {
                    task.delay(index * 0.1, () => {
                        if (element.IsA("TextLabel")) {
                            TweenService.Create(
                                element,
                                new TweenInfo(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                                {
                                    TextTransparency: 0,
                                },
                            ).Play();
                        } else if (element.IsA("ImageLabel")) {
                            TweenService.Create(
                                element,
                                new TweenInfo(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                                {
                                    ImageTransparency: 0,
                                },
                            ).Play();
                        }
                    });
                });
            }
        };

        // Phase 4: Pulsing glow effect (continuous for 2s)
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

                const pulse = (math.sin(time * 6) + 1) / 2;
                const transparency = 0.2 + pulse * 0.3;

                // Use quest color for glow
                const color = data.questColor;
                glow.BackgroundTransparency = transparency;
                glow.BackgroundColor3 = color;
            });
        };

        // Phase 5: Exit animation (0.5s, starts after 4s total)
        const exitAnimation = () => {
            const exitTween = TweenService.Create(
                mainFrame,
                new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                {
                    Position: new UDim2(0.5, 0, 1.2, 0),
                    Size: new UDim2(0.1, 0, 0.05, 0),
                },
            );

            // Fade out all elements
            if (titleTextRef.current) {
                const titleFrame = titleTextRef.current.Parent as Frame;
                const textLabels = titleFrame.GetChildren().filter((child) => child.IsA("TextLabel")) as TextLabel[];

                textLabels.forEach((label) => {
                    TweenService.Create(label, new TweenInfo(0.5), {
                        TextTransparency: 1,
                        TextStrokeTransparency: 1,
                    }).Play();
                });
            }

            if (questName) {
                TweenService.Create(questName, new TweenInfo(0.5), {
                    TextTransparency: 1,
                    TextStrokeTransparency: 1,
                }).Play();
            }

            if (rewardContainer) {
                TweenService.Create(rewardContainer, new TweenInfo(0.5), {
                    BackgroundTransparency: 1,
                }).Play();

                const rewardElements = rewardContainer
                    .GetDescendants()
                    .filter((child) => child.IsA("TextLabel") || child.IsA("ImageLabel"));
                rewardElements.forEach((element) => {
                    if (element.IsA("TextLabel")) {
                        TweenService.Create(element, new TweenInfo(0.5), {
                            TextTransparency: 1,
                        }).Play();
                    } else if (element.IsA("ImageLabel")) {
                        TweenService.Create(element, new TweenInfo(0.5), {
                            ImageTransparency: 1,
                        }).Play();
                    }
                });
            }

            if (glow) {
                TweenService.Create(glow, new TweenInfo(0.5), {
                    BackgroundTransparency: 1,
                }).Play();
            }

            exitTween.Play();
            exitTween.Completed.Connect(() => {
                setCelebrationParticles([]);
                onComplete();
            });
        };

        // Execute animation sequence
        entranceTween.Play();
        task.delay(0.3, contentFadeIn);
        task.delay(0.8, showRewards);
        task.delay(0.9, startGlowPulse);
        task.delay(4, exitAnimation);

        return () => {
            animationStarted.current = false;
        };
    }, [data.visible, data.questName, data.questColor, data.reward, onComplete]);

    if (!data.visible) {
        return <Fragment />;
    }

    // Get reward display text
    const rewards = [];

    if (data.reward.xp) {
        rewards.push(`+${data.reward.xp} XP`);
    }

    if (data.reward.items) {
        for (const [itemId, count] of pairs(data.reward.items)) {
            const name = Items.getItem(itemId)?.name;
            rewards.push(`x${count} ${name ?? itemId}`);
        }
    }

    if (data.reward.area) {
        rewards.push(`Access to ${AREAS[data.reward.area].name}`);
    }

    return (
        <frame ref={mainFrameRef} AnchorPoint={new Vector2(0.5, 0.5)} BackgroundTransparency={1} ZIndex={5}>
            {/* Size constraints */}
            <uisizeconstraint MaxSize={new Vector2(500, 300)} MinSize={new Vector2(200, 100)} />

            {/* Background glow effect */}
            <frame
                ref={glowRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={data.questColor}
                BackgroundTransparency={0.4}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(1, 15, 1, 15)}
                ZIndex={-1}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, data.questColor),
                            new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, data.questColor),
                        ])
                    }
                    Rotation={30}
                />
            </frame>

            {/* Main content background */}
            <frame
                BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                BorderColor3={data.questColor}
                BorderSizePixel={2}
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
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1} />
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />

                {/* "QUEST COMPLETE!" title with 3D effects */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.35, 0)} ZIndex={2}>
                    {/* 3D Shadow layer */}
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 2, 0, 2)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="QUEST COMPLETE!"
                        TextColor3={Color3.fromRGB(30, 30, 30)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0.3}
                        TextTransparency={0.4}
                        ZIndex={1}
                    >
                        <uistroke Thickness={1} />
                    </textlabel>

                    {/* Main text layer */}
                    <textlabel
                        ref={titleTextRef}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="QUEST COMPLETE!"
                        TextColor3={Color3.fromRGB(175, 255, 194)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(60, 120, 60)}
                        TextStrokeTransparency={0}
                        ZIndex={2}
                    >
                        <uistroke Thickness={2} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.5, Color3.fromRGB(175, 255, 194)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(100, 200, 120)),
                                ])
                            }
                            Rotation={-30}
                        />
                    </textlabel>

                    {/* Shine overlay */}
                    <textlabel
                        ref={shineTextRef}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text="QUEST COMPLETE!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextTransparency={0.8}
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
                                    new NumberSequenceKeypoint(0.4, 1),
                                    new NumberSequenceKeypoint(0.5, 0.2),
                                    new NumberSequenceKeypoint(0.6, 1),
                                    new NumberSequenceKeypoint(1, 1),
                                ])
                            }
                            Rotation={45}
                        />
                    </textlabel>
                </frame>

                {/* Quest name */}
                <textlabel
                    ref={questNameRef}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0, 0, 0.35, 0)}
                    Size={new UDim2(1, 0, 0.2, 0)}
                    Text={data.questName}
                    TextColor3={data.questColor}
                    TextScaled={true}
                    TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                    TextStrokeTransparency={0}
                    ZIndex={2}
                >
                    <uistroke Thickness={1} />
                </textlabel>

                {/* Reward display */}
                <frame
                    ref={rewardContainerRef}
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundColor3={Color3.fromRGB(15, 15, 15)}
                    BackgroundTransparency={0.15}
                    BorderSizePixel={0}
                    LayoutOrder={3}
                    Position={new UDim2(0.5, 0, 0.65, 0)}
                    Size={new UDim2(0.95, 0, 0.3, 0)}
                >
                    <uistroke Color={data.questColor} Thickness={1} />
                    <textlabel
                        AnchorPoint={new Vector2(0, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Text="Rewards"
                        TextColor3={new Color3(50, 50, 50)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        Position={new UDim2(0, 5, 0, 0)}
                        Size={new UDim2(0.15, 0, 1, 0)}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    <textlabel
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(1, -5, 1, -5)}
                        Text={rewards.join(", ")}
                        TextColor3={Color3.fromRGB(255, 223, 62)}
                        TextScaled={true}
                        TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        ZIndex={2}
                    >
                        <uistroke Thickness={1} />
                        <uipadding
                            PaddingBottom={new UDim(0, 5)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                            PaddingTop={new UDim(0, 5)}
                        />
                    </textlabel>
                </frame>
            </frame>

            {/* Celebration particle effects */}
            {celebrationParticles.map((particle) => (
                <CelebrationParticle key={particle.id} angle={particle.angle} delay={particle.delay} />
            ))}
        </frame>
    );
}

// Individual celebration particle component
function CelebrationParticle({ angle, delay }: { angle: number; delay: number }) {
    const particleRef = useRef<ImageLabel>();

    useEffect(() => {
        if (!particleRef.current) return;

        const particle = particleRef.current;

        // Calculate initial position
        const centerX = 0.5;
        const centerY = 0.5;
        const distance = 60;
        const initialX = centerX + (math.cos(angle) * distance) / 400;
        const initialY = centerY + (math.sin(angle) * distance) / 200;

        particle.Position = new UDim2(initialX, 0, initialY, 0);
        particle.ImageTransparency = 1;
        particle.Size = new UDim2(0, 12, 0, 12);

        // Delayed animation start
        task.delay(delay, () => {
            if (!particle.Parent) return;

            particle.ImageTransparency = 0;

            // Animate outward burst
            const burstTween = TweenService.Create(
                particle,
                new TweenInfo(1.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {
                    Position: new UDim2(
                        initialX + (math.cos(angle) * 100) / 400,
                        0,
                        initialY + (math.sin(angle) * 100) / 200,
                        0,
                    ),
                    ImageTransparency: 1,
                    Size: new UDim2(0, 6, 0, 6),
                    Rotation: 180,
                },
            );

            burstTween.Play();
        });

        return () => {
            if (particle.Parent) {
                TweenService.Create(particle, new TweenInfo(0.1), { ImageTransparency: 1 }).Play();
            }
        };
    }, [angle, delay]);

    return (
        <imagelabel
            ref={particleRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Image={getAsset("assets/Spark.png")}
            ImageColor3={Color3.fromRGB(175, 255, 194)}
            Size={new UDim2(0, 12, 0, 12)}
            ZIndex={4}
        />
    );
}
