import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { TweenService, Workspace } from "@rbxts/services";
import {
    DEFAULT_TOAST_DURATION,
    MAX_TOAST_QUEUE,
    subscribeToasts,
    type ToastRequest,
    type ToastVariant,
} from "client/components/toast/ToastService";
import { RobotoMono, RobotoSlabBold } from "shared/asset/GameFonts";

const VARIANT_STYLES: Record<ToastVariant, { background: Color3; border: Color3; text: Color3 }> = {
    info: {
        background: Color3.fromRGB(35, 41, 52),
        border: Color3.fromRGB(83, 122, 255),
        text: Color3.fromRGB(223, 231, 255),
    },
    success: {
        background: Color3.fromRGB(30, 52, 41),
        border: Color3.fromRGB(74, 222, 128),
        text: Color3.fromRGB(220, 255, 231),
    },
    warning: {
        background: Color3.fromRGB(64, 52, 28),
        border: Color3.fromRGB(250, 204, 21),
        text: Color3.fromRGB(255, 241, 213),
    },
    error: {
        background: Color3.fromRGB(61, 28, 32),
        border: Color3.fromRGB(248, 113, 113),
        text: Color3.fromRGB(254, 226, 226),
    },
};

const DEFAULT_MAX_WIDTH = 420;
const ENTER_TWEEN_INFO = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
const EXIT_TWEEN_INFO = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.In);
const VISIBLE_BACKGROUND_TRANSPARENCY = 0.15;
const VISIBLE_STROKE_TRANSPARENCY = 0.4;
const HINT_TEXT_TRANSPARENCY = 0.35;

type ToastLifecycle = "entering" | "visible" | "exiting";

type ManagedToast = ToastRequest & {
    status: ToastLifecycle;
    count: number;
    baseMessage: string;
    revision: number;
};

export default function ToastManager() {
    const [toasts, setToasts] = useState<Array<ManagedToast>>([]);
    const [toastWidth, setToastWidth] = useState(DEFAULT_MAX_WIDTH);

    useEffect(() => {
        let viewportConnection: RBXScriptConnection | undefined;

        const computeWidth = () => {
            const camera = Workspace.CurrentCamera;
            if (!camera) {
                setToastWidth((prev) => (prev === DEFAULT_MAX_WIDTH ? prev : DEFAULT_MAX_WIDTH));
                return;
            }

            const viewport = camera.ViewportSize;
            const clamped = math.clamp(math.floor(viewport.X * 0.55), 260, DEFAULT_MAX_WIDTH);
            setToastWidth((prev) => (prev === clamped ? prev : clamped));
        };

        const bindViewport = () => {
            viewportConnection?.Disconnect();
            const camera = Workspace.CurrentCamera;
            if (camera) {
                viewportConnection = camera.GetPropertyChangedSignal("ViewportSize").Connect(computeWidth);
            }
            computeWidth();
        };

        const cameraConnection = Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(bindViewport);
        bindViewport();

        return () => {
            cameraConnection.Disconnect();
            viewportConnection?.Disconnect();
        };
    }, []);

    const dismissToast = useCallback((id: string, expectedRevision?: number) => {
        setToasts((prev) =>
            prev.map((toast) => {
                if (toast.id !== id) return toast;
                if (toast.status === "exiting") return toast;
                if (expectedRevision !== undefined && toast.revision !== expectedRevision) return toast;
                return { ...toast, status: "exiting" };
            }),
        );
    }, []);

    const handleEnterComplete = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((toast) => {
                if (toast.id !== id || toast.status !== "entering") return toast;
                return { ...toast, status: "visible" };
            }),
        );
    }, []);

    const handleExitComplete = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    useEffect(() => {
        let mounted = true;
        const connection = subscribeToasts((toast) => {
            if (!mounted) return;

            setToasts((prev) => {
                const updated = [...prev];

                let existingIndex: number | undefined;
                for (let index = updated.size() - 1; index >= 0; index--) {
                    const candidate = updated[index];
                    if (candidate.variant === toast.variant && candidate.message === toast.message) {
                        existingIndex = index;
                        break;
                    }
                }

                if (existingIndex !== undefined) {
                    const existingToast = updated[existingIndex];
                    const nextRevision = existingToast.revision + 1;
                    const mergedDuration = toast.duration ?? existingToast.duration ?? DEFAULT_TOAST_DURATION;
                    const mergedToast: ManagedToast = {
                        ...existingToast,
                        ...toast,
                        id: existingToast.id,
                        message: existingToast.baseMessage,
                        status: "entering",
                        count: existingToast.count + 1,
                        baseMessage: existingToast.baseMessage,
                        revision: nextRevision,
                        createdAt: os.clock(),
                        duration: mergedDuration,
                    };
                    updated[existingIndex] = mergedToast;
                    return updated;
                }

                const managedToast: ManagedToast = {
                    ...toast,
                    status: "entering",
                    count: 1,
                    baseMessage: toast.message,
                    revision: 0,
                    duration: toast.duration ?? DEFAULT_TOAST_DURATION,
                };
                updated.push(managedToast);

                while (updated.size() > MAX_TOAST_QUEUE) {
                    const index = updated.findIndex((candidate) => candidate.status !== "exiting");
                    if (index === -1) break;
                    if (updated[index].id === managedToast.id) break;
                    updated[index] = { ...updated[index], status: "exiting" };
                    break;
                }

                return updated;
            });
        });

        return () => {
            mounted = false;
            connection.disconnect();
        };
    }, [dismissToast]);

    const toastElements = useMemo(() => {
        return toasts.map((toast) => {
            const style = VARIANT_STYLES[toast.variant];

            return (
                <MemoizedToastItem
                    key={toast.id}
                    toast={toast}
                    style={style}
                    width={toastWidth}
                    onDismiss={dismissToast}
                    onEnterComplete={handleEnterComplete}
                    onExitComplete={handleExitComplete}
                />
            );
        });
    }, [toasts, toastWidth, dismissToast, handleEnterComplete, handleExitComplete]);

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <frame
                AnchorPoint={new Vector2(0.5, 0)}
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundTransparency={1}
                LayoutOrder={1}
                Position={new UDim2(0.5, 0, 0.05, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 8)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                />
                {toastElements}
            </frame>
        </frame>
    );
}

interface ToastItemProps {
    toast: ManagedToast;
    style: { background: Color3; border: Color3; text: Color3 };
    width: number;
    onDismiss: (id: string, expectedRevision?: number) => void;
    onEnterComplete: (id: string) => void;
    onExitComplete: (id: string) => void;
}

function ToastItem({ toast, style, width, onDismiss, onEnterComplete, onExitComplete }: ToastItemProps) {
    const buttonRef = useRef<TextButton>();
    const primaryTextRef = useRef<TextLabel>();
    const hintTextRef = useRef<TextLabel>();
    const strokeRef = useRef<UIStroke>();
    const scaleRef = useRef<UIScale>();
    const lastEnterRevision = useRef(-1);
    const lastExitRevision = useRef(-1);

    const horizontalPadding = math.floor(math.clamp((20 * width) / DEFAULT_MAX_WIDTH, 12, 20));
    const verticalPadding = math.floor(math.clamp((12 * width) / DEFAULT_MAX_WIDTH, 8, 12));
    const primaryTextSize = math.floor(math.clamp((22 * width) / DEFAULT_MAX_WIDTH, 16, 22));
    const hintTextSize = math.floor(math.clamp((14 * width) / DEFAULT_MAX_WIDTH, 11, 14));
    const listPadding = math.floor(math.clamp((6 * width) / DEFAULT_MAX_WIDTH, 4, 6));
    const baseMessage = toast.baseMessage ?? toast.message;
    const displayMessage = toast.count > 1 ? `${baseMessage} (x${toast.count})` : baseMessage;
    const shouldScheduleDismiss = toast.status !== "exiting";

    useEffect(() => {
        if (!shouldScheduleDismiss) {
            return undefined;
        }

        const revision = toast.revision;
        const duration = toast.duration ?? DEFAULT_TOAST_DURATION;
        const thread = task.delay(duration, () => {
            onDismiss(toast.id, revision);
        });

        return () => {
            task.cancel(thread);
        };
    }, [toast.id, toast.revision, toast.duration, shouldScheduleDismiss, onDismiss]);

    useEffect(() => {
        const button = buttonRef.current;
        const primary = primaryTextRef.current;
        const hint = hintTextRef.current;
        const stroke = strokeRef.current;
        const scale = scaleRef.current;
        if (!button || !primary || !hint || !stroke || !scale) return;

        if (button.AutomaticSize === Enum.AutomaticSize.Y) {
            button.Size = new UDim2(0, width, 0, 0);
        } else {
            button.Size = new UDim2(0, width, 0, button.Size.Y.Offset);
        }

        if (toast.status === "entering" && lastEnterRevision.current !== toast.revision) {
            lastEnterRevision.current = toast.revision;
            lastExitRevision.current = math.max(lastExitRevision.current, toast.revision - 1);

            button.BackgroundTransparency = 0.6;
            button.Size = new UDim2(0, width, 0, 0);
            primary.TextTransparency = 1;
            hint.TextTransparency = 1;
            stroke.Transparency = 1;
            scale.Scale = 0.92;

            const buttonTween = TweenService.Create(button, ENTER_TWEEN_INFO, {
                BackgroundTransparency: VISIBLE_BACKGROUND_TRANSPARENCY,
            });
            const primaryTween = TweenService.Create(primary, ENTER_TWEEN_INFO, {
                TextTransparency: 0,
            });
            const hintTween = TweenService.Create(hint, ENTER_TWEEN_INFO, {
                TextTransparency: HINT_TEXT_TRANSPARENCY,
            });
            const strokeTween = TweenService.Create(stroke, ENTER_TWEEN_INFO, {
                Transparency: VISIBLE_STROKE_TRANSPARENCY,
            });
            const scaleTween = TweenService.Create(scale, ENTER_TWEEN_INFO, {
                Scale: 1,
            });

            buttonTween.Play();
            primaryTween.Play();
            hintTween.Play();
            strokeTween.Play();
            scaleTween.Play();

            scaleTween.Completed.Once(() => {
                onEnterComplete(toast.id);
            });
        } else if (toast.status === "exiting" && lastExitRevision.current !== toast.revision) {
            lastExitRevision.current = toast.revision;

            const currentHeight = math.max(button.AbsoluteSize.Y, 4);
            button.ClipsDescendants = true;
            button.AutomaticSize = Enum.AutomaticSize.None;
            button.Size = new UDim2(0, width, 0, currentHeight);

            const buttonTween = TweenService.Create(button, EXIT_TWEEN_INFO, {
                BackgroundTransparency: 1,
                Size: new UDim2(0, width, 0, 0),
            });
            const primaryTween = TweenService.Create(primary, EXIT_TWEEN_INFO, {
                TextTransparency: 1,
            });
            const hintTween = TweenService.Create(hint, EXIT_TWEEN_INFO, {
                TextTransparency: 1,
            });
            const strokeTween = TweenService.Create(stroke, EXIT_TWEEN_INFO, {
                Transparency: 1,
            });
            const scaleTween = TweenService.Create(scale, EXIT_TWEEN_INFO, {
                Scale: 0.85,
            });

            buttonTween.Completed.Once(() => {
                onExitComplete(toast.id);
            });

            buttonTween.Play();
            primaryTween.Play();
            hintTween.Play();
            strokeTween.Play();
            scaleTween.Play();
        }
    }, [toast.status, toast.id, toast.revision, width, onEnterComplete, onExitComplete]);

    const handleDismiss = useCallback(() => onDismiss(toast.id), [onDismiss, toast.id]);

    return (
        <textbutton
            AutoButtonColor={false}
            BackgroundColor3={style.background}
            BackgroundTransparency={VISIBLE_BACKGROUND_TRANSPARENCY}
            LayoutOrder={toast.createdAt}
            Size={new UDim2(0, width, 0, 0)}
            AutomaticSize={Enum.AutomaticSize.Y}
            Text=""
            ZIndex={5}
            ref={buttonRef}
            Event={{
                Activated: handleDismiss,
                MouseButton1Click: handleDismiss,
            }}
        >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={style.border}
                Thickness={2}
                Transparency={VISIBLE_STROKE_TRANSPARENCY}
                ref={strokeRef}
            />
            <uiscale ref={scaleRef} />
            <uipadding
                PaddingBottom={new UDim(0, verticalPadding)}
                PaddingLeft={new UDim(0, horizontalPadding)}
                PaddingRight={new UDim(0, horizontalPadding - 4)}
                PaddingTop={new UDim(0, verticalPadding)}
            />
            <uisizeconstraint MaxSize={new Vector2(width, 200)} MinSize={new Vector2(width, 0)} />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                Padding={new UDim(0, listPadding)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={1}
                Size={new UDim2(1, 0, 0, 0)}
                Text={displayMessage}
                TextColor3={style.text}
                TextScaled={false}
                TextSize={primaryTextSize}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
                ref={primaryTextRef}
            />
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                LayoutOrder={2}
                Size={new UDim2(1, 0, 0, 0)}
                Text="Click to dismiss"
                TextColor3={style.text.Lerp(new Color3(1, 1, 1), 0.2)}
                TextSize={hintTextSize}
                TextTransparency={HINT_TEXT_TRANSPARENCY}
                TextWrapped={false}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
                ref={hintTextRef}
            />
        </textbutton>
    );
}

const MemoizedToastItem = memo(ToastItem);
