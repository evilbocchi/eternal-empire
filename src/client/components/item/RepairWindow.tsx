import Signal from "@antivivi/lemon-signal";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { RunService, TweenService } from "@rbxts/services";
import SingleDocumentManager from "client/components/sidebar/SingleDocumentManager";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import { showErrorToast } from "client/components/toast/ToastService";
import TechWindow from "client/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import Item from "shared/item/Item";
import type { RepairResultTier } from "shared/item/repair";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

type Phase = "idle" | "countdown" | "running" | "success" | "fail";

interface TargetData {
    id: number;
    angle: number;
    size: number;
    startTime: number; // When this target's approach circle starts closing
    approachDuration: number;
    direction: number; // Stores radius for positioning
    hit: boolean;
    hitTier?: RepairResultTier;
    goodWindow: number;
    greatWindow: number;
    perfectWindow: number;
    negativeGracePeriod: number;
}

const TARGET_FADE_IN_TWEENINFO = new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

const BASE_APPROACH_DURATION = 2.5; // seconds for the approach ring to close (easiest)
const FASTEST_APPROACH_DURATION = 0.7; // seconds for the approach ring to close (hardest)
const BASE_GOOD_WINDOW = 0.6; // acceptable progress window (± from 0) for easiest items
const MIN_GOOD_WINDOW = 0.3; // acceptable progress window (± from 0) for hardest items
const BASE_GREAT_WINDOW = 0.25; // great progress window (± from 0) for easiest items
const MIN_GREAT_WINDOW = 0.125; // great progress window (± from 0) for hardest items
const BASE_PERFECT_WINDOW = 0.07; // perfect tier window (± from 0) for easiest items
const MIN_PERFECT_WINDOW = 0.035; // perfect tier window (± from 0) for hardest items
const BASE_TARGETS_PACING = 1; // seconds between targets for easiest items
const MIN_TARGETS_PACING = 0.3; // seconds between targets for hardest items
const MIN_TARGETS = 3;
const MAX_TARGETS = 8;
const BASE_TARGET_SIZE = 100; // Largest target size for easiest items
const MIN_TARGET_SIZE = 50; // Smallest target size for hardest items

function calculateGoodWindow(itemIndex: number, totalItems: number): number {
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return BASE_GOOD_WINDOW - difficulty * (BASE_GOOD_WINDOW - MIN_GOOD_WINDOW);
}

function calculateGreatWindow(itemIndex: number, totalItems: number): number {
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return BASE_GREAT_WINDOW - difficulty * (BASE_GREAT_WINDOW - MIN_GREAT_WINDOW);
}

function calculatePerfectWindow(itemIndex: number, totalItems: number): number {
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return BASE_PERFECT_WINDOW - difficulty * (BASE_PERFECT_WINDOW - MIN_PERFECT_WINDOW);
}

function getResultTier(progress: number, perfectWindow: number, greatWindow: number): RepairResultTier {
    const absProgress = math.abs(progress);
    if (absProgress <= perfectWindow) return "Perfect";
    if (absProgress <= greatWindow) return "Great";
    return "Good";
}

function calculateTargetCount(itemIndex: number, totalItems: number): number {
    // Early items get 3 targets, later items get more
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return math.floor(MIN_TARGETS + difficulty * (MAX_TARGETS - MIN_TARGETS));
}

function calculateTargetSize(itemIndex: number, totalItems: number): number {
    // Early items get larger targets, later items get smaller
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return BASE_TARGET_SIZE - difficulty * (BASE_TARGET_SIZE - MIN_TARGET_SIZE);
}

function calculateApproachDuration(itemIndex: number, totalItems: number): number {
    // Early items get slower approach rate, later items get faster
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return BASE_APPROACH_DURATION - difficulty * (BASE_APPROACH_DURATION - FASTEST_APPROACH_DURATION);
}

function calculatePacing(itemIndex: number, totalItems: number): number {
    // Early items get slower pacing, later items get faster
    const difficulty = itemIndex / math.max(totalItems - 1, 1);
    return BASE_TARGETS_PACING - difficulty * (BASE_TARGETS_PACING - MIN_TARGETS_PACING);
}

export class RepairManager {
    static model: Model | undefined;
    static modelInfo: InstanceInfo | undefined;
    static placementId: string | undefined;
    static item: Item | undefined;

    static readonly updated = new Signal();

    static setRepairing(toRepair: Model | undefined) {
        this.model = toRepair;
        this.modelInfo = toRepair ? getAllInstanceInfo(toRepair) : undefined;
        this.placementId = toRepair ? toRepair.Name : undefined;
        const itemId = this.modelInfo ? this.modelInfo.ItemId : undefined;
        if (itemId) {
            this.item = Items.getItem(itemId);
        }
        if (toRepair) {
            SingleDocumentManager.open("Repair");
        } else {
            SingleDocumentManager.close("Repair");
        }
        this.updated.fire();
    }
}

export default function RepairWindow() {
    const { id, visible, closeDocument } = useSingleDocument({
        id: "Repair",
        onClose: () => {
            setPhase("idle");
            setActiveItem(undefined);
        },
    });
    const [activeItem, setActiveItem] = React.useState<Item | undefined>();
    const [phase, setPhase] = useState<Phase>("idle");
    const [countdownValue, setCountdownValue] = useState(3);
    const [attemptSeed, setAttemptSeed] = useState(0);
    const [feedback, setFeedback] = useState<string | undefined>();
    const [resultTier, setResultTier] = useState<RepairResultTier | undefined>();
    const [showResultTier, setShowResultTier] = useState(false);
    const random = useMemo(() => new Random(), []);
    const heartbeatRef = useRef<RBXScriptConnection>();
    const [sparks, setSparks] = useState<
        Array<{ id: string; angle: number; distance: number; delay: number; velocity: number; tier: RepairResultTier }>
    >([]);
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);

    // Multi-target state
    const [targets, setTargets] = useState<TargetData[]>([]);
    const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const targetsRef = useRef<TargetData[]>([]);
    const currentTargetIndexRef = useRef(0);

    targetsRef.current = targets;
    currentTargetIndexRef.current = currentTargetIndex;

    useEffect(() => {
        return () => {
            heartbeatRef.current?.Disconnect();
            heartbeatRef.current = undefined;
        };
    }, []);

    // Generate targets when starting a new attempt
    useEffect(() => {
        if (phase !== "countdown") return;

        // Calculate target count based on item difficulty
        const itemIndex = activeItem ? Items.sortedItems.indexOf(activeItem) : 0;

        // Apply difficulty reduction based on consecutive failures
        // Each failure makes the game progressively easier (up to 5 failures)
        const failureReduction = math.min(consecutiveFailures * 0.15, 0.75); // Up to 75% easier

        let targetCount = calculateTargetCount(itemIndex, Items.length);
        // Reduce target count on failures (minimum 2 targets)
        targetCount = math.max(math.floor(targetCount * (1 - failureReduction * 0.5)), 2);

        let targetSize = calculateTargetSize(itemIndex, Items.length);
        // Increase target size on failures
        targetSize = targetSize + failureReduction * 50;

        let approachDuration = calculateApproachDuration(itemIndex, Items.length);
        // Slow down approach on failures
        approachDuration = approachDuration + failureReduction * 1.5;

        let goodWindow = calculateGoodWindow(itemIndex, Items.length);
        // Widen windows on failures
        goodWindow = goodWindow + failureReduction * 0.3;

        let greatWindow = calculateGreatWindow(itemIndex, Items.length);
        greatWindow = greatWindow + failureReduction * 0.15;

        let perfectWindow = calculatePerfectWindow(itemIndex, Items.length);
        perfectWindow = perfectWindow + failureReduction * 0.05;

        const negativeGracePeriod = goodWindow + 0.05; // let the player witness their miss

        let pacing = calculatePacing(itemIndex, Items.length);
        // Increase pacing (slower) on failures
        pacing = pacing + failureReduction * 0.8;

        // Generate targets with random positions that don't overlap
        const newTargets: TargetData[] = [];
        const minDistance = 0.2; // Minimum distance between target centers (in scale units)
        const maxAttempts = 100; // Maximum attempts to find a non-overlapping position

        for (let i = 0; i < targetCount; i++) {
            // Space targets out in time
            const startTime = i * pacing;

            let angle: number;
            let radius: number;
            let attempts = 0;
            let validPosition = false;

            // Try to find a position that doesn't overlap with existing targets
            while (!validPosition && attempts < maxAttempts) {
                // Random angle and radius within playable area
                angle = random.NextNumber() * math.pi * 2;
                radius = 0.15 + random.NextNumber() * 0.25; // Between 0.15 and 0.4 from center

                // Calculate this position
                const x = 0.5 + math.cos(angle) * radius;
                const y = 0.5 + math.sin(angle) * radius;

                // Check distance to all existing targets
                validPosition = true;
                for (const existingTarget of newTargets) {
                    const existingX = 0.5 + math.cos(existingTarget.angle) * existingTarget.direction;
                    const existingY = 0.5 + math.sin(existingTarget.angle) * existingTarget.direction;

                    const distance = math.sqrt(math.pow(x - existingX, 2) + math.pow(y - existingY, 2));
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }

                attempts++;
            }

            // If we couldn't find a valid position after max attempts, just use the last one
            newTargets.push({
                id: i,
                angle: angle!,
                size: targetSize,
                startTime: startTime,
                approachDuration: approachDuration,
                direction: radius!, // Store radius in direction field
                hit: false,
                goodWindow: goodWindow,
                greatWindow: greatWindow,
                perfectWindow: perfectWindow,
                negativeGracePeriod: negativeGracePeriod,
            });
        }

        setTargets(newTargets);
        setCurrentTargetIndex(0);
    }, [phase, attemptSeed, activeItem, random, consecutiveFailures]);

    useEffect(() => {
        if (phase !== "countdown") return;

        let active = true;
        let value = 4;

        const advance = () => {
            if (!active) return;
            value -= 1;
            if (value === 0) {
                setPhase("running");
                setGameStartTime(tick());
                return;
            }

            setCountdownValue(value);
            setFeedback(
                targets.size() > 1
                    ? `Hit ${targets.size()} targets in sequence!`
                    : "Match the pulse when the rings meet!",
            );
            playSound("repair/Start.mp3", undefined, (sound) => {
                sound.PlaybackSpeed = 0.8 + (3 - value) * 0.1;
            });

            task.delay(0.4, () => {
                if (!active) return;
                advance();
            });
        };

        advance();

        return () => {
            active = false;
        };
    }, [phase, attemptSeed, targets]);

    useEffect(() => {
        if (phase !== "running") return;

        heartbeatRef.current?.Disconnect();
        setFeedback(undefined);

        heartbeatRef.current = RunService.Heartbeat.Connect((dt) => {
            if (phase !== "running") return;

            const elapsed = tick() - gameStartTime;
            setCurrentTime(elapsed);

            // Check if we've failed any target by letting it go too negative
            const currentTargets = targetsRef.current;
            for (const target of currentTargets) {
                if (target.hit) continue;

                const targetElapsed = elapsed - target.startTime;
                if (targetElapsed > target.approachDuration + target.negativeGracePeriod) {
                    // Auto-fail if we missed a target completely
                    heartbeatRef.current?.Disconnect();
                    heartbeatRef.current = undefined;
                    setPhase("fail");
                    setFeedback("Missed a target! The mechanism jammed.");
                    playSound("Error.mp3");
                    setConsecutiveFailures((prev) => prev + 1);
                    return;
                }
            }

            // Check if all targets are hit
            const allHit = currentTargets.every((t) => t.hit);
            if (allHit) {
                heartbeatRef.current?.Disconnect();
                heartbeatRef.current = undefined;

                // Calculate overall tier based on all hits
                const tiers: RepairResultTier[] = [];
                for (const t of currentTargets) {
                    if (t.hitTier !== undefined) {
                        tiers.push(t.hitTier);
                    }
                }
                const perfectCount = tiers.filter((t) => t === "Perfect").size();
                const greatCount = tiers.filter((t) => t === "Great").size();

                let overallTier: RepairResultTier;
                if (perfectCount === tiers.size()) {
                    overallTier = "Perfect";
                } else if (perfectCount + greatCount === tiers.size()) {
                    overallTier = "Great";
                } else {
                    overallTier = "Good";
                }

                setResultTier(overallTier);
                setPhase("success");
                setFeedback(`All targets hit! ${overallTier} repair sequence!`);
            }
        });

        return () => {
            heartbeatRef.current?.Disconnect();
            heartbeatRef.current = undefined;
        };
    }, [phase, attemptSeed, gameStartTime]);

    const handleTargetActivated = (targetId: number) => {
        if (phase !== "running") return;

        const currentTargets = [...targetsRef.current];
        const target = currentTargets.find((t) => t.id === targetId);
        if (!target || target.hit) return;

        const elapsed = currentTime - target.startTime;
        const progress = 1 - elapsed / target.approachDuration;

        if (math.abs(progress) <= target.goodWindow) {
            const tier = getResultTier(progress, target.perfectWindow, target.greatWindow);
            target.hit = true;
            target.hitTier = tier;
            setTargets(currentTargets);

            // Play sound for this hit
            playSound("repair/Hit.mp3");

            // Move to next target
            if (targetId === currentTargetIndexRef.current) {
                setCurrentTargetIndex(currentTargetIndexRef.current + 1);
            }
        } else {
            // Bad hit
            heartbeatRef.current?.Disconnect();
            heartbeatRef.current = undefined;
            setPhase("fail");
            if (progress > target.goodWindow) {
                setFeedback("Too early! The calibrators rattled loose.");
            } else {
                setFeedback("Too late! The calibrators rattled loose.");
            }
            playSound("Error.mp3");
            setConsecutiveFailures((prev) => prev + 1);
        }
    };

    useEffect(() => {
        if (phase === "success" && resultTier !== undefined) {
            const tier = resultTier;
            if (tier === "Perfect") {
                playSound("repair/Perfect.mp3");
            } else if (tier === "Great") {
                playSound("repair/Great.mp3");
            } else {
                playSound("repair/Good.mp3");
            }

            // Reset failure counter on success
            setConsecutiveFailures(0);

            // Delay showing the tier text for dramatic effect
            setShowResultTier(false);
            task.delay(0.2, () => {
                setShowResultTier(true);
            });

            // Create spark effects for Great and Perfect completions
            if (tier === "Perfect" || tier === "Great") {
                const sparkCount = tier === "Perfect" ? 24 : 16;
                const sparkArray: Array<{
                    id: string;
                    angle: number;
                    distance: number;
                    delay: number;
                    velocity: number;
                    tier: RepairResultTier;
                }> = [];
                for (let i = 0; i < sparkCount; i++) {
                    sparkArray.push({
                        id: `spark_${i}_${tick()}`,
                        angle: (i / sparkCount) * math.pi * 2,
                        distance: 80 + math.random() * 40,
                        delay: math.random() * 0.3,
                        velocity: tier === "Perfect" ? 120 + math.random() * 80 : 80 + math.random() * 60,
                        tier: tier,
                    });
                }
                setSparks(sparkArray);

                // Clear sparks after animation completes
                task.delay(3, () => {
                    setSparks([]);
                });
            }

            const placementId = RepairManager.placementId;
            if (placementId === undefined) return;

            const accepted = Packets.repairItem.toServer(placementId, tier);
            if (accepted === false) {
                showErrorToast("Repair request failed. Try again.");
            }
        }
    }, [phase]);

    const startDisabled = phase === "countdown" || phase === "running";
    const showCountdown = phase === "countdown";

    const statusLabel = (() => {
        if (feedback) return feedback;

        // Show difficulty assistance message if player has failed multiple times
        const assistanceMessage =
            consecutiveFailures >= 2 ? ` (Difficulty reduced after ${consecutiveFailures} failures)` : "";

        switch (phase) {
            case "idle":
                return targets.size() > 1
                    ? `Hit ${targets.size()} targets in sequence to complete the repair.${assistanceMessage}`
                    : `Press start and time your click when the outer ring overlaps the core.${assistanceMessage}`;
            case "countdown":
                return "Steady your tools and wait for the pulse.";
            case "running": {
                const remainingTargets = targets.filter((t) => !t.hit).size();
                return remainingTargets > 0
                    ? `${remainingTargets} target${remainingTargets > 1 ? "s" : ""} remaining!`
                    : "All targets hit!";
            }
            case "success":
                if (resultTier) return `${resultTier} repair!`;
                return "Repair complete!";
            case "fail":
                return "Missed the timing—try again.";
        }
    })();

    useEffect(() => {
        if (phase === "success") return;

        const connection = Packets.itemRepairCompleted.fromServer((placementId, _tier) => {
            // Check if other clients repaired this item
            if (placementId === RepairManager.placementId) {
                playSound("repair/Complete.mp3");
                closeDocument();
            }
        });
        return () => connection.Disconnect();
    }, [phase]);

    useEffect(() => {
        const connection = RepairManager.updated.connect(() => {
            setActiveItem(RepairManager.item);
            // Reset state when a new item is selected
            resetToIdle();
            // Reset failure counter when switching items
            setConsecutiveFailures(0);
        });
        return () => connection.Disconnect();
    }, []);

    const beginRun = () => {
        heartbeatRef.current?.Disconnect();
        heartbeatRef.current = undefined;

        setResultTier(undefined);
        setShowResultTier(false);
        setAttemptSeed((attempt) => attempt + 1);
        setPhase("countdown");
    };

    const resetToIdle = () => {
        heartbeatRef.current?.Disconnect();
        heartbeatRef.current = undefined;
        setPhase("idle");
        setFeedback(undefined);
        setShowResultTier(false);
        setTargets([]);
        setCurrentTargetIndex(0);
    };

    if (!activeItem) {
        return (
            <TechWindow title="Repair Station" icon={getAsset("assets/Broken.png")} id={id} visible={visible}>
                <Fragment />
            </TechWindow>
        );
    }

    return (
        <TechWindow title="Repair Station" icon={getAsset("assets/Broken.png")} id={id} visible={visible}>
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(1, -10, 0.4, 0)}
                Text={activeItem.name.upper()}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextTransparency={0.9}
                TextScaled={true}
                ZIndex={-5}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(200, 200, 200)),
                        ])
                    }
                />
            </textlabel>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                <uilistlayout
                    Padding={new UDim(0, 12)}
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <imagebutton
                    AutoButtonColor={false}
                    BackgroundColor3={Color3.fromRGB(18, 18, 18)}
                    BackgroundTransparency={0.15}
                    BorderSizePixel={0}
                    Image={getAsset("assets/Vignette.png")}
                    ImageTransparency={0.5}
                    Size={new UDim2(1, 0, 1, -82)}
                    Event={{ Activated: () => playSound("Click.mp3") }}
                >
                    <imagelabel
                        BackgroundTransparency={1}
                        Image={getAsset("assets/Grid.png")}
                        ImageTransparency={0.95}
                        ImageColor3={Color3.fromRGB(100, 100, 100)}
                        ScaleType={Enum.ScaleType.Tile}
                        Size={new UDim2(1, 0, 1, 0)}
                        TileSize={new UDim2(0, 128, 0, 128)}
                    >
                        <uicorner CornerRadius={new UDim(0, 18)} />
                    </imagelabel>
                    <uicorner CornerRadius={new UDim(0, 18)} />
                    <uistroke Color={Color3.fromRGB(255, 255, 255)} Transparency={0.7} />
                    <uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Height} />

                    <textlabel
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoMono}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(1, 0, 0, 32)}
                        Text={showCountdown ? `${countdownValue}` : ""}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        Visible={showCountdown}
                    >
                        <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
                    </textlabel>

                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                        {/* Render all targets */}
                        {targets.map((target) => {
                            const elapsed = currentTime - target.startTime;
                            const progress = 1 - elapsed / target.approachDuration;

                            // Calculate fixed position (no movement) - radius stored in direction field
                            const radius = target.direction; // Radius is stored in direction field
                            const x = 0.5 + math.cos(target.angle) * radius;
                            const y = 0.5 + math.sin(target.angle) * radius;
                            const position = new UDim2(x, 0, y, 0);

                            // Determine visibility - target appears when its approach starts
                            const isVisible = elapsed >= 0 && !target.hit;

                            // Target color based on state
                            let targetColor = Color3.fromRGB(255, 212, 120);
                            let strokeColor = Color3.fromRGB(110, 58, 0);
                            if (target.hit) {
                                if (target.hitTier === "Perfect") {
                                    targetColor = Color3.fromRGB(255, 215, 0);
                                    strokeColor = Color3.fromRGB(120, 60, 0);
                                } else if (target.hitTier === "Great") {
                                    targetColor = Color3.fromRGB(100, 200, 255);
                                    strokeColor = Color3.fromRGB(20, 60, 120);
                                } else {
                                    targetColor = Color3.fromRGB(150, 255, 150);
                                    strokeColor = Color3.fromRGB(30, 100, 30);
                                }
                            }

                            // Number label for sequence
                            const sequenceNumber = target.id + 1;

                            return (
                                <imagebutton
                                    ref={(rbx) => {
                                        if (rbx === undefined) return;
                                        if (isVisible) {
                                            TweenService.Create(rbx, TARGET_FADE_IN_TWEENINFO, {
                                                BackgroundTransparency: 0,
                                            }).Play();
                                        } else {
                                            rbx.BackgroundTransparency = 1;
                                        }
                                    }}
                                    key={`target-${target.id}`}
                                    Active={isVisible && !target.hit}
                                    AnchorPoint={new Vector2(0.5, 0.5)}
                                    AutoButtonColor={false}
                                    BackgroundTransparency={1}
                                    BackgroundColor3={targetColor}
                                    Position={position}
                                    Size={new UDim2(0, target.size, 0, target.size)}
                                    Visible={isVisible || target.hit}
                                    Event={{
                                        Activated: () => handleTargetActivated(target.id),
                                    }}
                                    ZIndex={target.hit ? 1 : 2}
                                >
                                    <uicorner CornerRadius={new UDim(1, 0)} />
                                    <uistroke Color={strokeColor} Thickness={2} />

                                    {/* Sequence number */}
                                    <textlabel
                                        AnchorPoint={new Vector2(0.5, 0.5)}
                                        BackgroundTransparency={1}
                                        FontFace={RobotoMonoBold}
                                        Position={new UDim2(0.5, 0, 0.5, 0)}
                                        Size={new UDim2(0.6, 0, 0.6, 0)}
                                        Text={`${sequenceNumber}`}
                                        TextColor3={Color3.fromRGB(50, 25, 0)}
                                        TextScaled={true}
                                        Visible={!target.hit}
                                        ZIndex={3}
                                    />

                                    {/* Approach circle */}
                                    {isVisible && !target.hit && (
                                        <frame
                                            Active={true}
                                            AnchorPoint={new Vector2(0.5, 0.5)}
                                            BackgroundTransparency={1}
                                            Position={new UDim2(0.5, 0, 0.5, 0)}
                                            Size={new UDim2(1, math.abs(progress) * 150, 1, math.abs(progress) * 150)}
                                        >
                                            <uicorner CornerRadius={new UDim(1, 0)} />
                                            <uistroke
                                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                                Color={
                                                    progress >= 0
                                                        ? Color3.fromRGB(255, 148, 117)
                                                        : Color3.fromRGB(255, 100, 100)
                                                }
                                                Thickness={3}
                                                Transparency={0.2}
                                            />
                                            <uigradient
                                                Color={
                                                    progress >= 0
                                                        ? new ColorSequence([
                                                              new ColorSequenceKeypoint(0, Color3.fromRGB(44, 82, 136)),
                                                              new ColorSequenceKeypoint(
                                                                  1,
                                                                  Color3.fromRGB(117, 200, 255),
                                                              ),
                                                          ])
                                                        : new ColorSequence([
                                                              new ColorSequenceKeypoint(0, Color3.fromRGB(136, 44, 44)),
                                                              new ColorSequenceKeypoint(
                                                                  1,
                                                                  Color3.fromRGB(255, 100, 100),
                                                              ),
                                                          ])
                                                }
                                                Rotation={-45}
                                            />
                                        </frame>
                                    )}

                                    {/* Hit indicator */}
                                    {target.hit && target.hitTier && (
                                        <textlabel
                                            AnchorPoint={new Vector2(0.5, 0.5)}
                                            BackgroundTransparency={1}
                                            FontFace={RobotoMonoBold}
                                            Position={new UDim2(0.5, 0, 0.5, 0)}
                                            Size={new UDim2(0.8, 0, 0.4, 0)}
                                            Text={
                                                target.hitTier === "Perfect"
                                                    ? "!!"
                                                    : target.hitTier === "Great"
                                                      ? "!"
                                                      : "✓"
                                            }
                                            TextColor3={Color3.fromRGB(255, 255, 255)}
                                            TextScaled={true}
                                            ZIndex={3}
                                        >
                                            <uistroke Color={strokeColor} Thickness={2} />
                                        </textlabel>
                                    )}
                                </imagebutton>
                            );
                        })}

                        {phase === "success" && resultTier && showResultTier && <ResultTierDisplay tier={resultTier} />}

                        {phase === "fail" && (
                            <textlabel
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                Size={new UDim2(0.9, 0, 0.2, 0)}
                                Text="Resetting gears..."
                                TextColor3={Color3.fromRGB(255, 140, 140)}
                                TextScaled={true}
                            >
                                <uistroke Color={Color3.fromRGB(87, 16, 16)} Thickness={2} />
                            </textlabel>
                        )}
                    </frame>

                    {/* Spark effects for Great/Perfect completions */}
                    {sparks.map((spark) => (
                        <SparkEffect
                            key={spark.id}
                            angle={spark.angle}
                            distance={spark.distance}
                            delay={spark.delay}
                            velocity={spark.velocity}
                            tier={spark.tier}
                        />
                    ))}
                </imagebutton>

                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Size={new UDim2(1, 0, 0, 22)}
                    Text={statusLabel}
                    TextColor3={Color3.fromRGB(205, 255, 255)}
                    TextScaled={true}
                    TextWrapped={true}
                />

                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 36)}>
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        Padding={new UDim(0, 10)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />

                    {phase === "idle" && (
                        <MiniGameOption
                            text="Start Repair"
                            color={Color3.fromRGB(28, 207, 150)}
                            onClick={() => {
                                playSound("CheckOn.mp3");
                                beginRun();
                            }}
                        />
                    )}

                    {phase === "fail" && (
                        <MiniGameOption
                            text="Repair Again"
                            color={Color3.fromRGB(255, 214, 135)}
                            onClick={() => {
                                playSound("CheckOn.mp3");
                                beginRun();
                            }}
                        />
                    )}

                    {(phase === "success" || phase === "fail") && (
                        <MiniGameOption
                            text="Exit"
                            color={Color3.fromRGB(156, 156, 156)}
                            onClick={() => {
                                if (phase === "success") {
                                    RepairManager.setRepairing(undefined);
                                    return;
                                }

                                playSound("CheckOff.mp3");
                                resetToIdle();
                            }}
                        />
                    )}
                </frame>
            </frame>
        </TechWindow>
    );
}

// Animated result tier display component
function ResultTierDisplay({ tier }: { tier: RepairResultTier }) {
    const textRef = useRef<TextLabel>();
    const glowRef = useRef<Frame>();

    // Different colors and sizes for each tier
    const tierConfig = useMemo(() => {
        switch (tier) {
            case "Perfect":
                return {
                    color: Color3.fromRGB(255, 215, 0), // Gold
                    glowColor: Color3.fromRGB(255, 255, 150),
                    strokeColor: Color3.fromRGB(120, 60, 0),
                    size: new UDim2(0.9, 0, 0.4, 0),
                    glowSize: 40,
                };
            case "Great":
                return {
                    color: Color3.fromRGB(100, 200, 255), // Light blue
                    glowColor: Color3.fromRGB(150, 220, 255),
                    strokeColor: Color3.fromRGB(20, 60, 120),
                    size: new UDim2(0.8, 0, 0.35, 0),
                    glowSize: 30,
                };
            case "Good":
                return {
                    color: Color3.fromRGB(150, 255, 150), // Light green
                    glowColor: Color3.fromRGB(200, 255, 200),
                    strokeColor: Color3.fromRGB(30, 100, 30),
                    size: new UDim2(0.7, 0, 0.3, 0),
                    glowSize: 20,
                };
        }
    }, [tier]);

    useEffect(() => {
        if (!textRef.current || !glowRef.current) return;

        const text = textRef.current;
        const glow = glowRef.current;

        // Initial state - small and transparent
        text.Size = new UDim2(0, 0, 0, 0);
        text.TextTransparency = 1;
        text.TextStrokeTransparency = 1;
        text.Rotation = -15;
        glow.BackgroundTransparency = 1;
        glow.Size = new UDim2(0, 0, 0, 0);

        // Animate entrance with spring-like effect
        const sizeTween = TweenService.Create(
            text,
            new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
            {
                Size: tierConfig.size,
                Rotation: 0,
            },
        );

        const fadeTween = TweenService.Create(
            text,
            new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {
                TextTransparency: 0,
                TextStrokeTransparency: 0,
            },
        );

        const glowSizeTween = TweenService.Create(
            glow,
            new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {
                Size: new UDim2(1, tierConfig.glowSize, 1, tierConfig.glowSize),
            },
        );

        const glowFadeTween = TweenService.Create(
            glow,
            new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {
                BackgroundTransparency: 0.6,
            },
        );

        sizeTween.Play();
        fadeTween.Play();
        glowSizeTween.Play();
        glowFadeTween.Play();

        // Pulsing glow effect for Perfect tier
        if (tier === "Perfect") {
            let pulseConnection: RBXScriptConnection | undefined;
            let time = 0;

            task.delay(0.3, () => {
                pulseConnection = RunService.Heartbeat.Connect((deltaTime) => {
                    if (!glow.Parent) {
                        pulseConnection?.Disconnect();
                        return;
                    }

                    time += deltaTime;
                    const pulse = (math.sin(time * 8) + 1) / 2; // 0 to 1
                    const transparency = 0.4 + pulse * 0.4; // 0.4 to 0.8
                    glow.BackgroundTransparency = transparency;

                    // Stop after 2 seconds
                    if (time > 2) {
                        pulseConnection?.Disconnect();
                    }
                });
            });

            return () => {
                pulseConnection?.Disconnect();
            };
        }

        // Gentle pulse for Great tier
        if (tier === "Great") {
            let pulseConnection: RBXScriptConnection | undefined;
            let time = 0;

            task.delay(0.3, () => {
                pulseConnection = RunService.Heartbeat.Connect((deltaTime) => {
                    if (!glow.Parent) {
                        pulseConnection?.Disconnect();
                        return;
                    }

                    time += deltaTime;
                    const pulse = (math.sin(time * 5) + 1) / 2; // 0 to 1
                    const transparency = 0.5 + pulse * 0.3; // 0.5 to 0.8
                    glow.BackgroundTransparency = transparency;

                    if (time > 2) {
                        pulseConnection?.Disconnect();
                    }
                });
            });

            return () => {
                pulseConnection?.Disconnect();
            };
        }
    }, [tier, tierConfig]);

    return (
        <frame
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Size={new UDim2(1, -90, 1, -90)}
            ZIndex={10}
        >
            {/* Glow effect behind text */}
            <frame
                ref={glowRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={tierConfig.glowColor}
                BackgroundTransparency={1}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0, 0, 0, 0)}
                ZIndex={9}
            >
                <uicorner CornerRadius={new UDim(0, 16)} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, tierConfig.glowColor),
                            new ColorSequenceKeypoint(0.5, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, tierConfig.glowColor),
                        ])
                    }
                    Rotation={45}
                    Transparency={
                        new NumberSequence([
                            new NumberSequenceKeypoint(0, 0.8),
                            new NumberSequenceKeypoint(0.5, 0.3),
                            new NumberSequenceKeypoint(1, 0.8),
                        ])
                    }
                />
            </frame>

            {/* Main text with shadow layers for 3D effect */}
            {/* Shadow layer */}
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.5, 3, 0.5, 3)}
                Size={tierConfig.size}
                Text={`${tier}!`}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextTransparency={0.5}
                ZIndex={10}
            />

            {/* Main text */}
            <textlabel
                ref={textRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={tierConfig.size}
                Text={`${tier}!`}
                TextColor3={tierConfig.color}
                TextScaled={true}
                ZIndex={11}
            >
                <uistroke Color={tierConfig.strokeColor} Thickness={tier === "Perfect" ? 4 : 3} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.5, tierConfig.color),
                            new ColorSequenceKeypoint(1, tierConfig.color.Lerp(Color3.fromRGB(0, 0, 0), 0.3)),
                        ])
                    }
                    Rotation={-45}
                />
            </textlabel>
        </frame>
    );
}

function MiniGameOption({ text, color, onClick }: { text: string; color: Color3; onClick: () => void }) {
    return (
        <textbutton
            BackgroundColor3={color}
            BorderColor3={Color3.fromRGB(255, 255, 255)}
            BorderSizePixel={3}
            Size={new UDim2(0.4, 0, 1, 0)}
            Text={""}
            Active={true}
            Event={{ Activated: onClick }}
        >
            <uipadding
                PaddingTop={new UDim(0, 6)}
                PaddingBottom={new UDim(0, 6)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 1, 0)}
                Text={text}
                TextColor3={new Color3(1, 1, 1)}
                TextScaled={true}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
            </textlabel>
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
            <uigradient
                Color={new ColorSequence(Color3.fromRGB(255, 255, 255), color.Lerp(Color3.fromRGB(255, 255, 255), 0.5))}
                Rotation={90}
            />
        </textbutton>
    );
}

function SparkEffect({
    angle,
    distance,
    delay,
    velocity,
    tier,
}: {
    angle: number;
    distance: number;
    delay: number;
    velocity: number;
    tier: RepairResultTier;
}) {
    const sparkRef = useRef<ImageLabel>();

    // Determine spark color based on tier
    const sparkColor = useMemo(() => {
        switch (tier) {
            case "Perfect":
                return Color3.fromRGB(255, 223, 62); // Golden yellow
            case "Great":
                return Color3.fromRGB(100, 200, 255); // Light blue
            case "Good":
                return Color3.fromRGB(150, 255, 150); // Light green
        }
    }, [tier]);

    useEffect(() => {
        if (!sparkRef.current) return;

        const spark = sparkRef.current;

        // Calculate initial position around the target button
        const centerX = 0.5;
        const centerY = 0.5;
        const initialX = centerX + (math.cos(angle) * distance) / 1000;
        const initialY = centerY + (math.sin(angle) * distance) / 1000;

        // Physics properties
        let positionX = initialX;
        let positionY = initialY;
        let velocityX = (math.cos(angle) * velocity) / 1000;
        let velocityY = (math.sin(angle) * velocity) / 1000 - 0.2;
        const gravity = 0.6; // Gravity acceleration (downward)
        const damping = 0.98; // Air resistance

        let time = 0;
        let animationConnection: RBXScriptConnection | undefined;

        spark.Position = new UDim2(positionX, 0, positionY, 0);
        spark.ImageTransparency = 1; // Start invisible
        spark.Size = new UDim2(0, 12, 0, 12);

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
                spark.Size = new UDim2(0, 12 * scale, 0, 12 * scale);

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
        };
    }, [angle, distance, delay, velocity]);

    return (
        <imagelabel
            ref={sparkRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Image={getAsset("assets/Spark.png")}
            ImageColor3={sparkColor}
            Size={new UDim2(0, 12, 0, 12)}
            ZIndex={5}
        />
    );
}
