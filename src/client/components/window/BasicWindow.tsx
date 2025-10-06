import React, { ReactNode, RefObject, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import DocumentManager from "client/components/window/DocumentManager";
import WindowCloseButton from "client/components/window/WindowCloseButton";
import WindowTitle from "client/components/window/WindowTitle";
import { playSound } from "shared/asset/GameAssets";

export function useWindowAnimation({
    frameRef,
    contentRef,
    titleRef,
    iconRef,
    textRef,
    closeButtonRef,
    initialPosition,
    visible,
}: {
    frameRef: RefObject<GuiObject>;
    contentRef: RefObject<GuiObject>;
    titleRef?: RefObject<GuiObject>;
    iconRef?: RefObject<ImageLabel>;
    textRef?: RefObject<TextLabel>;
    closeButtonRef?: RefObject<TextButton>;
    initialPosition: UDim2;
    visible: boolean;
}) {
    const [previousVisible, setPreviousVisible] = useState(visible);

    useEffect(() => {
        const action = visible && !previousVisible ? "open" : !visible && previousVisible ? "close" : undefined;
        // Handle animation
        if (action) {
            const frame = frameRef.current!;
            const content = contentRef.current;
            const title = titleRef?.current;
            const icon = iconRef?.current;
            const text = textRef?.current;
            const closeButton = closeButtonRef?.current;

            if (action === "open") {
                frame.Visible = true;
                playSound("MenuOpen.mp3");
            } else {
                playSound("MenuClose.mp3");
            }

            const middle = initialPosition;
            const below = middle.sub(new UDim2(0, 0, 0, 30));
            frame.Position = action === "open" ? below : middle;

            const tweenInfo =
                action === "open"
                    ? new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
                    : new TweenInfo(0.1, Enum.EasingStyle.Linear);
            const tween = TweenService.Create(frame, tweenInfo, {
                Position: action === "open" ? middle : below,
            });

            // Animate title with layered effect
            if (title) {
                const titleInitialPos = new UDim2(0, 12, 0, 0);
                const titleOffset = titleInitialPos.add(new UDim2(0, 0, 0, -8));
                title.Position = action === "open" ? titleOffset : titleInitialPos;

                const titleTweenInfo =
                    action === "open"
                        ? new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
                        : new TweenInfo(0.075, Enum.EasingStyle.Linear);

                const titleTween = TweenService.Create(title, titleTweenInfo, {
                    Position: action === "open" ? titleInitialPos : titleOffset,
                });
                titleTween.Play();
            }

            // Animate icon with rotation
            if (icon) {
                icon.Rotation = action === "open" ? -90 : 0;

                const iconTweenInfo =
                    action === "open"
                        ? new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
                        : new TweenInfo(0.1, Enum.EasingStyle.Linear);

                const iconTween = TweenService.Create(icon, iconTweenInfo, {
                    Rotation: action === "open" ? 0 : -90,
                });
                iconTween.Play();
            }

            // Animate title text with slight rotation
            if (text) {
                text.Rotation = action === "open" ? -5 : 0;

                const textTweenInfo =
                    action === "open"
                        ? new TweenInfo(0.45, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
                        : new TweenInfo(0.1, Enum.EasingStyle.Linear);

                const textTween = TweenService.Create(text, textTweenInfo, {
                    Rotation: action === "open" ? 0 : -5,
                });
                textTween.Play();
            }

            // Animate close button with rotation
            if (closeButton) {
                closeButton.Rotation = action === "open" ? 90 : 0;

                const closeButtonTweenInfo =
                    action === "open"
                        ? new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
                        : new TweenInfo(0.1, Enum.EasingStyle.Linear);

                const closeButtonTween = TweenService.Create(closeButton, closeButtonTweenInfo, {
                    Rotation: action === "open" ? 0 : 90,
                });
                closeButtonTween.Play();
            }

            // Animate content with layered effect
            if (content) {
                const contentInitialPos = new UDim2(0.5, 0, 0.075, 0);
                const contentOffset = contentInitialPos.add(new UDim2(0, 0, 0, -10));
                content.Position = action === "open" ? contentOffset : contentInitialPos;

                const contentTweenInfo =
                    action === "open"
                        ? new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
                        : new TweenInfo(0.1, Enum.EasingStyle.Linear);

                const contentTween = TweenService.Create(content, contentTweenInfo, {
                    Position: action === "open" ? contentInitialPos : contentOffset,
                });
                contentTween.Play();
            }

            tween.Play();
            tween.Completed.Connect(() => {
                frame.Visible = visible;
            });
        }
        setPreviousVisible(visible);
    }, [visible]);
}

export default function BasicWindow({
    icon,
    id,
    title,
    visible,
    children,
    backgroundColor,
    strokeColor,
}: {
    icon: string;
    id: string;
    title?: string;
    visible: boolean;
    backgroundColor?: ColorSequence;
    strokeColor: ColorSequence;
    children: ReactNode;
    size?: UDim2;
}) {
    if (backgroundColor === undefined) {
        const keypoints = new Array<ColorSequenceKeypoint>();
        for (const keypoint of strokeColor.Keypoints) {
            keypoints.push(new ColorSequenceKeypoint(keypoint.Time, keypoint.Value.Lerp(Color3.fromRGB(0, 0, 0), 0.3)));
        }
        backgroundColor = new ColorSequence(keypoints);
    }
    const frameRef = useRef<Frame>();
    const contentRef = useRef<Frame>();
    const titleRef = useRef<Frame>();
    const iconRef = useRef<ImageLabel>();
    const textRef = useRef<TextLabel>();
    const closeButtonRef = useRef<TextButton>();
    const initialPosition = new UDim2(0.5, 0, 1, -40);

    useWindowAnimation({
        frameRef,
        contentRef,
        titleRef,
        iconRef,
        textRef,
        closeButtonRef,
        initialPosition,
        visible,
    });

    return (
        <frame
            ref={frameRef}
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundColor3={Color3.fromRGB(255, 255, 255)}
            BackgroundTransparency={0.6}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            Position={initialPosition}
            Size={new UDim2(0.45, 200, 0.4, 100)}
            ZIndex={0}
            Visible={false}
        >
            <WindowTitle ref={titleRef} iconRef={iconRef} textRef={textRef} icon={icon} title={title ?? id} />
            <WindowCloseButton ref={closeButtonRef} onClick={() => DocumentManager.setVisible(id, false)} />
            <frame
                ref={contentRef}
                key="MainWindow"
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.075, 0)}
                Size={new UDim2(1, -30, 0.925, -15)}
            >
                {children}
            </frame>
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} Thickness={2}>
                <uigradient Color={strokeColor} Rotation={90} />
            </uistroke>
            <uigradient Color={backgroundColor} Rotation={90} />
        </frame>
    );
}
