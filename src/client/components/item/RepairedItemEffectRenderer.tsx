import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import type { RepairResultTier } from "shared/item/repair";
import Packets from "shared/Packets";

const TweenService = game.GetService("TweenService");

interface ActiveEffect {
    placementId: string;
    model: Model;
    primaryPart: BasePart;
    tier: RepairResultTier;
    startedAt: number;
    fadingOut?: boolean;
}

const EFFECT_DURATION: Record<RepairResultTier, number> = {
    Good: 3,
    Great: 4.5,
    Perfect: 8.5,
};

const FADE_OUT_DURATION = 0.8;

interface TierVisual {
    color: Color3;
    outline: Color3;
    brightness: number;
    range: number;
    fillTransparency: number;
    outlineTransparency: number;
}

const TIER_VISUALS: Record<RepairResultTier, TierVisual> = {
    Good: {
        color: Color3.fromRGB(140, 240, 180),
        outline: Color3.fromRGB(200, 255, 220),
        brightness: 1.8,
        range: 16,
        fillTransparency: 0.93,
        outlineTransparency: 0.6,
    },
    Great: {
        color: Color3.fromRGB(120, 210, 255),
        outline: Color3.fromRGB(170, 235, 255),
        brightness: 2.6,
        range: 20,
        fillTransparency: 0.85,
        outlineTransparency: 0.45,
    },
    Perfect: {
        color: Color3.fromRGB(255, 223, 62),
        outline: Color3.fromRGB(255, 255, 200),
        brightness: 4,
        range: 26,
        fillTransparency: 0.82,
        outlineTransparency: 0.35,
    },
};

function findPrimaryPart(model: Model) {
    const explicit = model.PrimaryPart;
    if (explicit && explicit.IsA("BasePart")) {
        return explicit;
    }

    const candidate = model.FindFirstChildWhichIsA("BasePart", true);
    return candidate ?? undefined;
}

export default function RepairedItemEffectRenderer() {
    const [effects, setEffects] = useState<Array<ActiveEffect>>([]);

    useEffect(() => {
        const connection = Packets.itemRepairCompleted.fromServer((placementId, tier) => {
            if (TIER_VISUALS[tier] === undefined) {
                setEffects((current) => current.filter((effect) => effect.placementId !== placementId));
                return;
            }

            const instance = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
            if (!instance || !instance.IsA("Model")) return;

            const primaryPart = findPrimaryPart(instance);
            if (!primaryPart) return;

            const startedAt = tick();
            const effect: ActiveEffect = {
                placementId,
                model: instance,
                primaryPart,
                tier,
                startedAt,
            };

            setEffects((current) => [...current.filter((existing) => existing.placementId !== placementId), effect]);

            const duration = EFFECT_DURATION[tier];
            task.delay(duration - FADE_OUT_DURATION, () => {
                setEffects((current) =>
                    current.map((existing) => {
                        if (existing.placementId === placementId && existing.startedAt === startedAt) {
                            return { ...existing, fadingOut: true };
                        }
                        return existing;
                    }),
                );
            });

            task.delay(duration, () => {
                setEffects((current) =>
                    current.filter(
                        (existing) => existing.placementId !== placementId || existing.startedAt !== startedAt,
                    ),
                );
            });
        });

        return () => {
            connection.Disconnect();
            setEffects([]);
        };
    }, []);

    const renderedEffects = useMemo(() => {
        return effects.map((effect) => {
            const visuals = TIER_VISUALS[effect.tier];
            const { color, outline, brightness, range, fillTransparency, outlineTransparency } = visuals;

            const light = ReactRoblox.createPortal(
                <pointlight
                    Brightness={brightness}
                    Range={range}
                    Color={color}
                    Shadows={true}
                    ref={(rbx) => {
                        if (rbx && effect.fadingOut) {
                            const tweenInfo = new TweenInfo(
                                FADE_OUT_DURATION,
                                Enum.EasingStyle.Quad,
                                Enum.EasingDirection.Out,
                            );
                            const tween = TweenService.Create(rbx, tweenInfo, {
                                Brightness: 0,
                            });
                            tween.Play();
                        }
                    }}
                />,
                effect.primaryPart,
            );

            return (
                <Fragment key={`${effect.placementId}-${effect.startedAt}`}>
                    {light}
                    <highlight
                        Adornee={effect.model}
                        FillColor={color}
                        FillTransparency={fillTransparency}
                        OutlineColor={outline}
                        OutlineTransparency={outlineTransparency}
                        ref={(rbx) => {
                            if (rbx && effect.fadingOut) {
                                const tweenInfo = new TweenInfo(
                                    FADE_OUT_DURATION,
                                    Enum.EasingStyle.Quad,
                                    Enum.EasingDirection.Out,
                                );
                                const tween = TweenService.Create(rbx, tweenInfo, {
                                    FillTransparency: 1,
                                    OutlineTransparency: 1,
                                });
                                tween.Play();
                            }
                        }}
                    />
                </Fragment>
            );
        });
    }, [effects]);

    return <Fragment>{renderedEffects}</Fragment>;
}
