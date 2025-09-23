/**
 * @fileoverview Chest loot notification component with item viewports and smooth animations.
 *
 * Features:
 * - Smooth slide-in from bottom
 * - Viewport previews of items with amounts
 * - Organized loot display (XP, Items)
 * - Understated animations appropriate for frequent chest openings
 * - Clean, modern design with subtle effects
 */

import React, { Fragment, useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { useItemViewport } from "client/ui/components/item/useCIViewportManagement";
import { TooltipManager } from "client/ui/components/tooltip/TooltipWindow";
import { RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";
import { playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";

export interface ChestLootData {
    loot: Array<{
        id: string | "xp";
        amount: number;
    }>;
    visible: boolean;
}

interface ChestLootNotificationProps {
    data: ChestLootData;
    onComplete: () => void;
    viewportManagement?: ItemViewportManagement;
}

export default function ChestLootNotification({ data, onComplete, viewportManagement }: ChestLootNotificationProps) {
    const mainFrameRef = useRef<Frame>();
    const animationStarted = useRef(false);

    // Main animation sequence
    useEffect(() => {
        if (!data.visible || !mainFrameRef.current || animationStarted.current) return;

        animationStarted.current = true;
        const mainFrame = mainFrameRef.current;

        // Play loot collection sound
        playSound("UnlockItem.mp3");

        // Initial setup - start off-screen from bottom
        mainFrame.Position = new UDim2(0.5, 0, 1.2, 0);

        // Phase 1: Smooth slide-in from bottom (0.4s)
        const entranceTween = TweenService.Create(
            mainFrame,
            new TweenInfo(0.4, Enum.EasingStyle.Quart, Enum.EasingDirection.Out),
            {
                Position: new UDim2(0.5, 0, 0.85, 0), // Bottom area of screen
            },
        );

        // Phase 2: Hold for 2.5 seconds to let player see the loot

        // Phase 3: Fade out and slide down (0.3s, starts after 3s total)
        const exitAnimation = () => {
            const exitTween = TweenService.Create(
                mainFrame,
                new TweenInfo(0.3, Enum.EasingStyle.Quart, Enum.EasingDirection.In),
                {
                    Position: new UDim2(0.5, 0, 1.2, 0),
                },
            );

            exitTween.Play();
            exitTween.Completed.Connect(() => {
                onComplete();
            });
        };

        // Execute animation sequence
        entranceTween.Play();
        task.delay(3, exitAnimation);

        return () => {
            animationStarted.current = false;
        };
    }, [data.visible, data.loot, onComplete]);

    if (!data.visible) {
        return <Fragment />;
    }

    // Organize loot by type
    const xpReward = data.loot.find((item) => item.id === "xp");
    const itemRewards = data.loot.filter((item) => item.id !== "xp");

    return (
        <frame
            ref={mainFrameRef}
            AutomaticSize={Enum.AutomaticSize.X}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Size={new UDim2(0, 0, 0.1, 0)}
            ZIndex={15}
        >
            {/* Size constraints */}
            <uisizeconstraint MaxSize={new Vector2(9999, 150)} MinSize={new Vector2(200, 100)} />

            {/* Main container */}
            <frame BackgroundColor3={Color3.fromRGB(35, 35, 45)} BorderSizePixel={0} Size={new UDim2(1, 0, 1, 0)}>
                <uicorner CornerRadius={new UDim(0, 12)} />
                <uistroke Color={Color3.fromRGB(100, 150, 200)} Thickness={2} />
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
                    FillDirection={Enum.FillDirection.Vertical}
                    Padding={new UDim(0.05, 0)}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Header */}
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(0, 0, 0.35, 0)}
                    Text="📦 Chest Loot"
                    TextColor3={Color3.fromRGB(200, 220, 255)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Center}
                >
                    <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1} />
                </textlabel>

                {/* Loot display */}
                <frame AutomaticSize={Enum.AutomaticSize.X} BackgroundTransparency={1} Size={new UDim2(0, 0, 0.6, 0)}>
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        Padding={new UDim(0, 8)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />

                    {/* XP Reward */}
                    {xpReward && (
                        <frame
                            BackgroundColor3={Color3.fromRGB(255, 215, 0)}
                            BorderSizePixel={0}
                            LayoutOrder={1}
                            Size={new UDim2(0, 60, 1, 0)}
                        >
                            <uicorner CornerRadius={new UDim(0, 8)} />
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 235, 100)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 195, 0)),
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
                                TextColor3={Color3.fromRGB(100, 50, 0)}
                                TextScaled={true}
                            />
                            <textlabel
                                AnchorPoint={new Vector2(0.5, 0.8)}
                                BackgroundTransparency={1}
                                FontFace={RobotoSlab}
                                Position={new UDim2(0.5, 0, 0.8, 0)}
                                Size={new UDim2(0.9, 0, 0.3, 0)}
                                Text={`+${xpReward.amount}`}
                                TextColor3={Color3.fromRGB(80, 40, 0)}
                                TextScaled={true}
                            />
                        </frame>
                    )}

                    {/* Item Rewards */}
                    {itemRewards.map((lootItem, index) => (
                        <LootItemSlot
                            key={`${lootItem.id}_${index}`}
                            itemId={lootItem.id}
                            amount={lootItem.amount}
                            layoutOrder={index + 2}
                            viewportManagement={viewportManagement}
                        />
                    ))}
                </frame>
            </frame>
        </frame>
    );
}

// Individual loot item slot component
function LootItemSlot({
    itemId,
    amount,
    layoutOrder,
    viewportManagement,
}: {
    itemId: string;
    amount: number;
    layoutOrder: number;
    viewportManagement?: ItemViewportManagement;
}) {
    const viewportRef = useRef<ViewportFrame>();
    const item = Items.getItem(itemId);

    useItemViewport(viewportRef, itemId, viewportManagement);

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
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    Image={item.image}
                    Position={new UDim2(0.5, 0, 0.1, 0)}
                    Size={new UDim2(1, 0, 0.65, 0)}
                />
            ) : (
                <viewportframe
                    ref={viewportRef}
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    Position={new UDim2(0.5, 0, 0.1, 0)}
                    Size={new UDim2(1, 0, 0.65, 0)}
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
        </frame>
    );
}
