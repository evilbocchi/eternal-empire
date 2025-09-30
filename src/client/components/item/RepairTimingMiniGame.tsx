import React, { Fragment, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";

type Phase = "idle" | "countdown" | "running" | "success" | "fail";

export type ResultTier = "Perfect" | "Great" | "Good";

const APPROACH_DURATION = 2.1; // seconds for the approach ring to close
const HOT_WINDOW = 0.12; // acceptable progress remaining when clicked
const PERFECT_WINDOW = 0.035; // perfect tier
const TARGET_SPEED = math.pi * 1.4; // radians per second
const INNER_SIZE = 0.34;
const TARGET_SIZE = 25; // in pixels

function getResultTier(progress: number): ResultTier {
    if (progress <= PERFECT_WINDOW) return "Perfect";
    if (progress <= HOT_WINDOW * 0.55) return "Great";
    return "Good";
}

export default function RepairTimingMiniGame({
    onFailure,
    onSuccess,
}: {
    /** Callback fired when the player successfully completes the timing window. */
    onSuccess?: (score: number, tier: ResultTier) => void;
    /** Callback fired when the attempt fails. */
    onFailure?: () => void;
}) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [countdownValue, setCountdownValue] = useState(3);
    const [approachProgress, setApproachProgress] = useState(1);
    const [targetAngle, setTargetAngle] = useState(0);
    const [attemptSeed, setAttemptSeed] = useState(0);
    const [feedback, setFeedback] = useState<string | undefined>();
    const [resultTier, setResultTier] = useState<ResultTier | undefined>();
    const random = useMemo(() => new Random(), []);
    const heartbeatRef = useRef<RBXScriptConnection>();
    const currentProgressRef = useRef(approachProgress);
    const currentAngleRef = useRef(0);

    currentProgressRef.current = approachProgress;

    useEffect(() => {
        // Initialize the angle on first mount
        if (attemptSeed === 0) {
            const initialAngle = random.NextNumber() * math.pi * 2;
            setTargetAngle(initialAngle);
            currentAngleRef.current = initialAngle;
        }
    }, []);

    useEffect(() => {
        return () => {
            heartbeatRef.current?.Disconnect();
            heartbeatRef.current = undefined;
        };
    }, []);

    useEffect(() => {
        if (phase !== "countdown") return;

        let active = true;
        let value = 3;
        setCountdownValue(value);
        setFeedback("Match the pulse when the rings meet!");

        const advance = () => {
            if (!active) return;
            if (value === 0) {
                setPhase("running");
                return;
            }

            playSound("RepairStart.mp3", undefined, (sound) => {
                sound.PlaybackSpeed = 0.8 + (3 - value) * 0.1;
            });

            task.delay(0.75, () => {
                if (!active) return;
                value -= 1;
                setCountdownValue(value);
                advance();
            });
        };

        advance();

        return () => {
            active = false;
        };
    }, [phase, attemptSeed]);

    useEffect(() => {
        if (phase !== "running") return;

        heartbeatRef.current?.Disconnect();

        let progress = 1;
        let angle = currentAngleRef.current; // Start from current position instead of random
        const direction = random.NextNumber() > 0.5 ? 1 : -1;
        setApproachProgress(1);
        setTargetAngle(angle);
        setFeedback(undefined);

        heartbeatRef.current = RunService.Heartbeat.Connect((dt) => {
            if (phase !== "running") return;

            progress = math.max(0, progress - dt / APPROACH_DURATION);
            angle = (angle + direction * dt * TARGET_SPEED) % (math.pi * 2);

            currentProgressRef.current = progress;
            currentAngleRef.current = angle;
            setApproachProgress(progress);
            setTargetAngle(angle);

            if (progress <= 0) {
                heartbeatRef.current?.Disconnect();
                heartbeatRef.current = undefined;
                setPhase("fail");
                setFeedback("Too slow! The mechanism jammed.");
                playSound("Error.mp3");
            }
        });

        return () => {
            heartbeatRef.current?.Disconnect();
            heartbeatRef.current = undefined;
        };
    }, [phase, attemptSeed]);

    useEffect(() => {
        if (phase === "success" && resultTier !== undefined) {
            const tier = resultTier;
            let pitch = 1;
            switch (tier) {
                case "Perfect":
                    pitch = 1.25;
                    break;
                case "Great":
                    pitch = 1.1;
                    break;
                default:
                    pitch = 1;
                    break;
            }
            playSound("MagicPowerUp.mp3", undefined, (sound) => {
                sound.PlaybackSpeed = pitch;
            });
            onSuccess?.(math.clamp(1 - currentProgressRef.current / HOT_WINDOW, 0, 1), tier);
        } else if (phase === "fail") {
            onFailure?.();
        }
    }, [phase]);

    const targetPosition = useMemo(() => {
        const radius = (INNER_SIZE / 2) * 0.8;
        const x = 0.5 + math.cos(targetAngle) * radius;
        const y = 0.5 + math.sin(targetAngle) * radius;
        return new UDim2(x, 0, y, 0);
    }, [targetAngle]);

    const startDisabled = phase === "countdown" || phase === "running";
    const showCountdown = phase === "countdown";

    const statusLabel = (() => {
        if (feedback) return feedback;
        switch (phase) {
            case "idle":
                return "Press start and time your click when the outer ring overlaps the core.";
            case "countdown":
                return "Steady your tools and wait for the pulse.";
            case "running":
                return "Click the moving target just as the rings meet!";
            case "success":
                if (resultTier) return `${resultTier} repair!`;
                return "Repair complete!";
            case "fail":
                return "Missed the timing—try again.";
        }
    })();

    const handleActivated = () => {
        if (phase !== "running") return;

        const remaining = currentProgressRef.current;
        heartbeatRef.current?.Disconnect();
        heartbeatRef.current = undefined;

        if (remaining <= HOT_WINDOW) {
            const tier = getResultTier(remaining);
            setResultTier(tier);
            setPhase("success");
            setFeedback(`Stabilized with ${tier} timing!`);
        } else {
            setPhase("fail");
            setFeedback("Too early! The calibrators rattled loose.");
            playSound("Error.mp3");
        }
    };

    const beginRun = () => {
        heartbeatRef.current?.Disconnect();
        heartbeatRef.current = undefined;

        setResultTier(undefined);
        setAttemptSeed((attempt) => attempt + 1);
        setApproachProgress(1);
        currentProgressRef.current = 1;
        setPhase("countdown");
    };

    const resetToIdle = () => {
        heartbeatRef.current?.Disconnect();
        heartbeatRef.current = undefined;
        setPhase("idle");
        setFeedback(undefined);
        setApproachProgress(1);
        currentProgressRef.current = 1;
    };

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <uilistlayout
                Padding={new UDim(0, 12)}
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <imagelabel
                BackgroundColor3={Color3.fromRGB(18, 18, 18)}
                BackgroundTransparency={0.15}
                BorderSizePixel={0}
                Image={getAsset("assets/Vignette.png")}
                ImageTransparency={0.5}
                Size={new UDim2(1, 0, 1, -82)}
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
                    <imagebutton
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        AutoButtonColor={false}
                        BackgroundTransparency={0}
                        BackgroundColor3={Color3.fromRGB(255, 212, 120)}
                        Position={targetPosition}
                        Size={new UDim2(0, TARGET_SIZE, 0, TARGET_SIZE)}
                        Event={{ Activated: handleActivated }}
                    >
                        <uicorner CornerRadius={new UDim(1, 0)} />
                        <uistroke Color={Color3.fromRGB(110, 58, 0)} Thickness={2} />

                        <textbutton
                            Active={true}
                            AnchorPoint={new Vector2(0.5, 0.5)}
                            AutoButtonColor={false}
                            BackgroundTransparency={1}
                            Text={""}
                            Position={new UDim2(0.5, 0, 0.5, 0)}
                            Size={new UDim2(1, approachProgress * 100 - 5, 1, approachProgress * 100 - 5)}
                        >
                            <uicorner CornerRadius={new UDim(1, 0)} />
                            <uistroke
                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                Color={Color3.fromRGB(255, 148, 117)}
                                Thickness={2}
                                Transparency={0.2}
                            />
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(44, 82, 136)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(117, 200, 255)),
                                    ])
                                }
                                Rotation={-45}
                            />
                        </textbutton>
                    </imagebutton>

                    {phase === "success" && (
                        <textlabel
                            AnchorPoint={new Vector2(0.5, 0.5)}
                            BackgroundTransparency={1}
                            FontFace={RobotoMonoBold}
                            Position={new UDim2(0.5, 0, 0.5, 0)}
                            Size={new UDim2(0.8, 0, 0.2, 0)}
                            Text={resultTier ? `${resultTier}!` : "Repaired!"}
                            TextColor3={Color3.fromRGB(255, 241, 173)}
                            TextScaled={true}
                        >
                            <uistroke Color={Color3.fromRGB(76, 46, 0)} Thickness={2} />
                        </textlabel>
                    )}

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
            </imagelabel>

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

                {(phase === "success" || phase === "fail") && (
                    <Fragment>
                        <MiniGameOption
                            text="Repair Again"
                            color={Color3.fromRGB(255, 214, 135)}
                            onClick={() => {
                                playSound("CheckOn.mp3");
                                beginRun();
                            }}
                        />
                        <MiniGameOption
                            text="Exit"
                            color={Color3.fromRGB(156, 156, 156)}
                            onClick={() => {
                                playSound("CheckOff.mp3");
                                resetToIdle();
                            }}
                        />
                    </Fragment>
                )}
            </frame>
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
