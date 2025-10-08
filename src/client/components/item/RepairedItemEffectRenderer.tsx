import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { isProtectionTier, type RepairProtectionTier } from "shared/item/repair";
import Packets from "shared/Packets";

const TweenService = game.GetService("TweenService");

interface ActiveEffect {
    placementId: string;
    model: Model;
    primaryPart: BasePart;
    tier: RepairProtectionTier;
    startedAt: number;
    fadingOut?: boolean;
}

const EFFECT_DURATION: Record<RepairProtectionTier, number> = {
    Great: 4.5,
    Perfect: 8.5,
};

const FADE_OUT_DURATION = 0.8;

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
            if (!isProtectionTier(tier)) {
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
            const color = effect.tier === "Perfect" ? Color3.fromRGB(255, 223, 62) : Color3.fromRGB(120, 210, 255);
            const outline = effect.tier === "Perfect" ? Color3.fromRGB(255, 255, 200) : Color3.fromRGB(170, 235, 255);
            const brightness = effect.tier === "Perfect" ? 4 : 2.6;
            const range = effect.tier === "Perfect" ? 26 : 20;

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
                        FillTransparency={0.85}
                        OutlineColor={outline}
                        OutlineTransparency={0.45}
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
