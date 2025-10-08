import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { useItemViewport } from "client/components/item/ItemViewport";
import { TooltipManager } from "client/components/tooltip/TooltipWindow";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoSlab, RobotoSlabBold } from "shared/asset/GameFonts";
import Items from "shared/items/Items";

export default function ChestLootNotification({
    loot,
    visible,
    onComplete,
}: {
    loot: Array<LootInfo>;
    visible: boolean;
    onComplete: () => void;
}) {
    const mainFrameRef = useRef<Frame>();
    const animationStarted = useRef(false);
    const exitTweenRef = useRef<Tween>();
    const entranceTweenRef = useRef<Tween>();
    const exitTimeoutRef = useRef<thread>();

    // Main animation sequence
    useEffect(() => {
        if (!visible || !mainFrameRef.current) return;
        // If animation is already running, clean up and restart
        if (animationStarted.current) {
            // Cancel existing tweens and timeouts
            if (exitTweenRef.current) {
                exitTweenRef.current.Cancel();
                exitTweenRef.current = undefined;
            }
            if (entranceTweenRef.current) {
                entranceTweenRef.current.Cancel();
                entranceTweenRef.current = undefined;
            }
            if (exitTimeoutRef.current) {
                task.cancel(exitTimeoutRef.current);
                exitTimeoutRef.current = undefined;
            }
        }

        animationStarted.current = true;
        const mainFrame = mainFrameRef.current;

        // Play loot collection sound
        playSound("UnlockItem.mp3");

        // Initial setup - start off-screen from bottom with no size
        mainFrame.Position = new UDim2(0.5, 0, 1.2, 0);
        mainFrame.Size = new UDim2(0, 0, 0, 0);

        // Phase 1: Smooth slide-in from bottom with scale animation (0.4s)
        const entranceTween = TweenService.Create(
            mainFrame,
            new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
            {
                Position: new UDim2(0.5, 0, 0.85, 0), // Bottom area of screen
                Size: new UDim2(0, 0, 0.04, 60), // Scale up to normal size
            },
        );
        entranceTweenRef.current = entranceTween;

        // Phase 2: Hold for 2.5 seconds to let player see the loot

        // Phase 3: Fade out and slide down with scale down (0.3s, starts after 3s total)
        const exitAnimation = () => {
            if (!mainFrame.Parent) return; // Guard against disposed frame

            const exitTween = TweenService.Create(
                mainFrame,
                new TweenInfo(0.3, Enum.EasingStyle.Quart, Enum.EasingDirection.In),
                {
                    Position: new UDim2(0.5, 0, 1.2, 0),
                    Size: new UDim2(0, 0, 0.02, 40), // Scale down while exiting
                },
            );
            exitTweenRef.current = exitTween;

            exitTween.Play();
            exitTween.Completed.Connect(() => {
                if (exitTweenRef.current === exitTween) {
                    // Only clean up if this is still the current tween
                    animationStarted.current = false;
                    exitTweenRef.current = undefined;
                    onComplete();
                }
            });
        };

        // Execute animation sequence
        entranceTween.Play();
        exitTimeoutRef.current = task.delay(3, exitAnimation);

        return () => {
            // Cleanup function to cancel any ongoing animations
            animationStarted.current = false;
            if (exitTweenRef.current) {
                exitTweenRef.current.Cancel();
                exitTweenRef.current = undefined;
            }
            if (entranceTweenRef.current) {
                entranceTweenRef.current.Cancel();
                entranceTweenRef.current = undefined;
            }
            if (exitTimeoutRef.current) {
                task.cancel(exitTimeoutRef.current);
                exitTimeoutRef.current = undefined;
            }
        };
    }, [visible, onComplete]);

    if (!visible) {
        return <Fragment />;
    }

    // Organize loot by type
    const xpReward = loot.find((item) => item.id === "xp");
    const itemRewards = loot.filter((item) => item.id !== "xp");

    return (
        <frame
            ref={mainFrameRef}
            AutomaticSize={Enum.AutomaticSize.X}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Size={new UDim2(0, 0, 0.02, 40)}
            ZIndex={15}
        >
            {/* Main container */}
            <frame BackgroundColor3={Color3.fromRGB(35, 35, 45)} BorderSizePixel={0} Size={new UDim2(1, 0, 1, 0)}>
                <uicorner CornerRadius={new UDim(0, 12)} />
                <uistroke Color={Color3.fromRGB(160, 130, 98)} Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(50, 50, 60)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                        ])
                    }
                    Rotation={90}
                />
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 8)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                {/* XP Reward */}
                {xpReward && <XPRewardSlot amount={xpReward.amount} />}

                {/* Item Rewards */}
                {itemRewards.map((lootItem, index) => (
                    <LootItemSlot itemId={lootItem.id} amount={lootItem.amount} layoutOrder={index + 2} />
                ))}
            </frame>
        </frame>
    );
}

// XP Reward slot component with sparks
function XPRewardSlot({ amount }: { amount: number }) {
    const slotRef = useRef<Frame>();
    const [sparkParticles, setSparkParticles] = useState<Array<{ id: string; angle: number; delay: number }>>([]);

    // Create spark particles for this slot
    const createSlotSparks = () => {
        const particles: Array<{ id: string; angle: number; delay: number }> = [];
        for (let i = 0; i < 6; i++) {
            particles.push({
                id: `xp_spark_${i}_${tick()}`,
                angle: (i / 3) * math.pi * 2,
                delay: math.random() * 0.2,
            });
        }
        setSparkParticles(particles);
    };

    useEffect(() => {
        // Create sparks when the slot mounts
        task.delay(0.1, createSlotSparks);

        // Clean up sparks after animation
        task.delay(2, () => setSparkParticles([]));
    }, []);

    return (
        <frame
            ref={slotRef}
            BackgroundColor3={Color3.fromRGB(255, 255, 255)}
            BorderSizePixel={0}
            LayoutOrder={1}
            Size={new UDim2(0, 60, 1, 0)}
        >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 182, 193)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 105, 180)),
                    ])
                }
                Rotation={45}
            />
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.3)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0.5, 0, 0.3, 0)}
                Size={new UDim2(0.9, 0, 0.4, 0)}
                Text="XP"
                TextColor3={Color3.fromRGB(100, 20, 60)}
                TextScaled={true}
            />
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.8)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0.8, 0)}
                Size={new UDim2(1, 0, 0.3, 0)}
                Text={`+${amount}`}
                TextColor3={Color3.fromRGB(80, 15, 50)}
                TextScaled={true}
            />

            {/* Spark particles for XP slot */}
            {sparkParticles.map((particle) => (
                <SlotSparkParticle
                    key={particle.id}
                    angle={particle.angle}
                    delay={particle.delay}
                    color={Color3.fromRGB(255, 255, 255)}
                />
            ))}
        </frame>
    );
}

// Individual loot item slot component
function LootItemSlot({ itemId, amount, layoutOrder }: { itemId: string; amount: number; layoutOrder: number }) {
    const viewportRef = useRef<ViewportFrame>();
    const item = Items.getItem(itemId);
    const [sparkParticles, setSparkParticles] = useState<Array<{ id: string; angle: number; delay: number }>>([]);

    useItemViewport(viewportRef, itemId);

    // Create spark particles for this slot
    const createSlotSparks = () => {
        const particles: Array<{ id: string; angle: number; delay: number }> = [];
        for (let i = 0; i < 6; i++) {
            particles.push({
                id: `item_spark_${i}_${tick()}`,
                angle: (i / 3) * math.pi * 2,
                delay: math.random() * 0.2,
            });
        }
        setSparkParticles(particles);
    };

    useEffect(() => {
        // Create sparks when the slot mounts
        task.delay(0.1, createSlotSparks);

        // Clean up sparks after animation
        task.delay(2, () => setSparkParticles([]));
    }, []);

    if (!item) {
        return <Fragment />;
    }

    const backgroundColor = item.difficulty.color ?? Color3.fromRGB(52, 155, 255);

    return (
        <frame
            BackgroundColor3={backgroundColor}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(0, 60, 1, 0)}
            Event={{
                MouseMoved: () => {
                    if (!item) return;
                    TooltipManager.showTooltip({ item });
                },
                MouseLeave: () => {
                    TooltipManager.hideTooltip();
                },
            }}
        >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={1} />
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(80, 80, 90)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(60, 60, 70)),
                    ])
                }
                Rotation={90}
            />

            {/* Item viewport or image */}
            {item.image !== undefined ? (
                <imagelabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={item.image}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, 0, 0, 0)}
                    ScaleType={Enum.ScaleType.Fit}
                />
            ) : (
                <viewportframe
                    ref={viewportRef}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, 0, 1, 0)}
                />
            )}

            {/* Amount label */}
            <textlabel
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0.55, 0)}
                Size={new UDim2(1, 0, 0.35, 0)}
                Text={amount > 1 ? `x${amount}` : ""}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                TextStrokeTransparency={0}
            >
                <uistroke Thickness={1} />
            </textlabel>

            {/* Item difficulty border */}
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={backgroundColor} Thickness={2} />

            {/* Spark particles for item slot */}
            {sparkParticles.map((particle) => (
                <SlotSparkParticle
                    key={particle.id}
                    angle={particle.angle}
                    delay={particle.delay}
                    color={backgroundColor}
                />
            ))}
        </frame>
    );
}

// Individual slot spark particle component
function SlotSparkParticle({ angle, delay, color }: { angle: number; delay: number; color: Color3 }) {
    const particleRef = useRef<ImageLabel>();

    useEffect(() => {
        if (!particleRef.current) return;

        const particle = particleRef.current;

        // Calculate initial position (center of slot)
        const centerX = 0.5;
        const centerY = 0.5;
        const distance = 20;
        const initialX = centerX + (math.cos(angle) * distance) / 200;
        const initialY = centerY + (math.sin(angle) * distance) / 100;

        particle.Position = new UDim2(initialX, 0, initialY, 0);
        particle.ImageTransparency = 1;
        particle.Size = new UDim2(0, 6, 0, 6);

        // Delayed animation start
        task.delay(delay, () => {
            if (!particle.Parent) return;

            particle.ImageTransparency = 0;

            // Animate outward burst
            const burstTween = TweenService.Create(
                particle,
                new TweenInfo(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {
                    Position: new UDim2(
                        initialX + (math.cos(angle) * 40) / 200,
                        0,
                        initialY + (math.sin(angle) * 40) / 100,
                        0,
                    ),
                    ImageTransparency: 1,
                    Size: new UDim2(0, 3, 0, 3),
                    Rotation: 60,
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
            ImageColor3={color}
            Size={new UDim2(0, 9, 0, 9)}
            ZIndex={16}
        />
    );
}
