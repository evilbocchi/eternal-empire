import { simpleInterval } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { ProximityPromptService, RunService, TextService, TweenService, UserInputService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import { IS_EDIT } from "shared/Context";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import CustomProximityPrompt from "shared/world/CustomProximityPrompt";
import WorldNode from "shared/world/nodes/WorldNode";

// Helper functions for button image mappings
function getGamepadButtonImage(keyCode: Enum.KeyCode): string | undefined {
    const map = new Map<Enum.KeyCode, string>([
        [Enum.KeyCode.ButtonX, "rbxasset://textures/ui/Controls/xboxX.png"],
        [Enum.KeyCode.ButtonY, "rbxasset://textures/ui/Controls/xboxY.png"],
        [Enum.KeyCode.ButtonA, "rbxasset://textures/ui/Controls/xboxA.png"],
        [Enum.KeyCode.ButtonB, "rbxasset://textures/ui/Controls/xboxB.png"],
        [Enum.KeyCode.DPadLeft, "rbxasset://textures/ui/Controls/dpadLeft.png"],
        [Enum.KeyCode.DPadRight, "rbxasset://textures/ui/Controls/dpadRight.png"],
        [Enum.KeyCode.DPadUp, "rbxasset://textures/ui/Controls/dpadUp.png"],
        [Enum.KeyCode.DPadDown, "rbxasset://textures/ui/Controls/dpadDown.png"],
        [Enum.KeyCode.ButtonSelect, "rbxasset://textures/ui/Controls/xboxmenu.png"],
        [Enum.KeyCode.ButtonL1, "rbxasset://textures/ui/Controls/xboxLS.png"],
        [Enum.KeyCode.ButtonR1, "rbxasset://textures/ui/Controls/xboxRS.png"],
    ]);
    return map.get(keyCode);
}

function getKeyboardButtonImage(keyCode: Enum.KeyCode): string | undefined {
    const map = new Map<Enum.KeyCode, string>([
        [Enum.KeyCode.Backspace, "rbxasset://textures/ui/Controls/backspace.png"],
        [Enum.KeyCode.Return, "rbxasset://textures/ui/Controls/return.png"],
        [Enum.KeyCode.LeftShift, "rbxasset://textures/ui/Controls/shift.png"],
        [Enum.KeyCode.RightShift, "rbxasset://textures/ui/Controls/shift.png"],
        [Enum.KeyCode.Tab, "rbxasset://textures/ui/Controls/tab.png"],
    ]);
    return map.get(keyCode);
}

function getKeyboardButtonIconMapping(char: string): string | undefined {
    const map: Record<string, string> = {
        ["'"]: "rbxasset://textures/ui/Controls/apostrophe.png",
        [","]: "rbxasset://textures/ui/Controls/comma.png",
        ["`"]: "rbxasset://textures/ui/Controls/graveaccent.png",
        ["."]: "rbxasset://textures/ui/Controls/period.png",
        [" "]: "rbxasset://textures/ui/Controls/spacebar.png",
    };
    return map[char];
}

function getKeyCodeToText(keyCode: Enum.KeyCode): string | undefined {
    const map = new Map<Enum.KeyCode, string>([
        [Enum.KeyCode.LeftControl, "Ctrl"],
        [Enum.KeyCode.RightControl, "Ctrl"],
        [Enum.KeyCode.LeftAlt, "Alt"],
        [Enum.KeyCode.RightAlt, "Alt"],
        [Enum.KeyCode.F1, "F1"],
        [Enum.KeyCode.F2, "F2"],
        [Enum.KeyCode.F3, "F3"],
        [Enum.KeyCode.F4, "F4"],
        [Enum.KeyCode.F5, "F5"],
        [Enum.KeyCode.F6, "F6"],
        [Enum.KeyCode.F7, "F7"],
        [Enum.KeyCode.F8, "F8"],
        [Enum.KeyCode.F9, "F9"],
        [Enum.KeyCode.F10, "F10"],
        [Enum.KeyCode.F11, "F11"],
        [Enum.KeyCode.F12, "F12"],
    ]);
    return map.get(keyCode);
}

export default function ProximityPromptGui({
    prompt,
    inputType,
    fadeOut = false,
    fadeIn = false,
}: {
    prompt: ProximityPrompt;
    inputType: Enum.ProximityPromptInputType;
    fadeOut?: boolean;
    fadeIn?: boolean;
}) {
    const [progress, setProgress] = useState(0);
    const [frameSize, setFrameSize] = useState(UDim2.fromScale(1, 1));
    const [frameTransparency, setFrameTransparency] = useState(fadeIn ? 1 : 0.2);
    const [inputScale, setInputScale] = useState(fadeIn ? 0 : 1);
    const [actionTextTransparency, setActionTextTransparency] = useState(fadeIn ? 1 : 0);
    const [objectTextTransparency, setObjectTextTransparency] = useState(fadeIn ? 1 : 0);
    const [promptSize, setPromptSize] = useState(new UDim2(0, 193, 0, 72));
    const [actionTextPosition, setActionTextPosition] = useState(new UDim2(0.5, -24, 0, 9));
    const [objectTextPosition, setObjectTextPosition] = useState(new UDim2(0.5, -24, 0, -10));
    const [actionText, setActionText] = useState(prompt.ActionText);
    const [objectText, setObjectText] = useState(prompt.ObjectText);
    const [isHolding, setIsHolding] = useState(false);
    const [holdStartTime, setHoldStartTime] = useState(0);

    // Determine button visuals based on input type
    const [buttonImage, setButtonImage] = useState<string | undefined>();
    const [buttonText, setButtonText] = useState<string | undefined>();
    const [buttonIconImage, setButtonIconImage] = useState<string | undefined>();
    const [showButtonImage, setShowButtonImage] = useState(false);
    const [showButtonText, setShowButtonText] = useState(false);
    const [showButtonIcon, setShowButtonIcon] = useState(false);

    // Refs for tween management
    const frameRef = useRef<ImageLabel>();
    const inputScaleRef = useRef<UIScale>();
    const actionTextRef = useRef<TextLabel>();
    const objectTextRef = useRef<TextLabel>();

    // Handle fade in animations
    useEffect(() => {
        if (!fadeIn) return;

        const tweenInfoFast = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

        // Scale up and fade in
        if (inputScaleRef.current) {
            TweenService.Create(inputScaleRef.current, tweenInfoFast, {
                Scale: 1,
            }).Play();
        }

        if (frameRef.current) {
            TweenService.Create(frameRef.current, tweenInfoFast, {
                ImageTransparency: 0.2,
            }).Play();
        }

        // Tween text transparency
        if (actionTextRef.current) {
            TweenService.Create(actionTextRef.current, tweenInfoFast, {
                TextTransparency: 0,
            }).Play();
        }

        if (objectTextRef.current) {
            TweenService.Create(objectTextRef.current, tweenInfoFast, {
                TextTransparency: 0,
            }).Play();
        }
    }, [fadeIn]);

    // Handle fade out animations
    useEffect(() => {
        if (!fadeOut) return;

        const tweenInfoFast = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

        // Scale down and fade out
        if (inputScaleRef.current) {
            TweenService.Create(inputScaleRef.current, tweenInfoFast, {
                Scale: 0,
            }).Play();
        }

        if (frameRef.current) {
            TweenService.Create(frameRef.current, tweenInfoFast, {
                ImageTransparency: 1,
            }).Play();
        }

        // Tween text transparency
        if (actionTextRef.current) {
            TweenService.Create(actionTextRef.current, tweenInfoFast, {
                TextTransparency: 1,
            }).Play();
        }

        if (objectTextRef.current) {
            TweenService.Create(objectTextRef.current, tweenInfoFast, {
                TextTransparency: 1,
            }).Play();
        }
    }, [fadeOut]);

    useEffect(() => {
        // Determine button display based on input type
        if (inputType === Enum.ProximityPromptInputType.Gamepad) {
            const gamepadImage = getGamepadButtonImage(prompt.GamepadKeyCode);
            if (gamepadImage) {
                setButtonIconImage(gamepadImage);
                setShowButtonIcon(true);
                setShowButtonText(false);
                setShowButtonImage(false);
            }
        } else if (inputType === Enum.ProximityPromptInputType.Touch) {
            setButtonImage("rbxasset://textures/ui/Controls/TouchTapIcon.png");
            setShowButtonImage(true);
            setShowButtonText(false);
            setShowButtonIcon(false);
        } else {
            // Keyboard input
            setShowButtonImage(true);

            const buttonTextString = UserInputService.GetStringForKeyCode(prompt.KeyboardKeyCode);
            let buttonTextImageAsset = getKeyboardButtonImage(prompt.KeyboardKeyCode);

            if (!buttonTextImageAsset) {
                buttonTextImageAsset = getKeyboardButtonIconMapping(buttonTextString);
            }

            if (buttonTextImageAsset) {
                setButtonIconImage(buttonTextImageAsset);
                setShowButtonIcon(true);
                setShowButtonText(false);
            } else {
                let displayText = buttonTextString;
                const keyCodeMappedText = getKeyCodeToText(prompt.KeyboardKeyCode);
                if (keyCodeMappedText) {
                    displayText = keyCodeMappedText;
                }

                if (displayText && displayText !== "") {
                    setButtonText(displayText);
                    setShowButtonText(true);
                    setShowButtonIcon(false);
                } else {
                    warn(
                        `ProximityPrompt '${prompt.Name}' has an unsupported keycode for rendering UI: ${prompt.KeyboardKeyCode}`,
                    );
                }
            }
        }
    }, [prompt, inputType]);

    useEffect(() => {
        // Update UI sizing based on text
        const updateUIFromPrompt = () => {
            const actionTextSize = TextService.GetTextSize(
                prompt.ActionText,
                19,
                Enum.Font.RobotoMono,
                new Vector2(1000, 1000),
            );
            const objectTextSize = TextService.GetTextSize(
                prompt.ObjectText,
                14,
                Enum.Font.RobotoMono,
                new Vector2(1000, 1000),
            );
            const maxTextWidth = math.max(actionTextSize.X, objectTextSize.X);
            let promptHeight = 72;
            let promptWidth = 72;
            const textPaddingLeft = 72;

            if (
                (prompt.ActionText !== undefined && prompt.ActionText !== "") ||
                (prompt.ObjectText !== undefined && prompt.ObjectText !== "")
            ) {
                promptWidth = maxTextWidth + textPaddingLeft + 24;
            }

            let actionTextYOffset = 0;
            if (prompt.ObjectText !== undefined && prompt.ObjectText !== "") {
                actionTextYOffset = 9;
            }

            setActionTextPosition(new UDim2(0.5, textPaddingLeft - promptWidth / 2, 0, actionTextYOffset));
            setObjectTextPosition(new UDim2(0.5, textPaddingLeft - promptWidth / 2, 0, -10));
            setActionText(prompt.ActionText);
            setObjectText(prompt.ObjectText);
            setPromptSize(UDim2.fromOffset(promptWidth, promptHeight));
        };

        updateUIFromPrompt();
        const changedConnection = (prompt.Changed as RBXScriptSignal<() => void>).Connect(updateUIFromPrompt);

        return () => {
            changedConnection.Disconnect();
        };
    }, [prompt]);

    // Manage hold progress with React state
    useEffect(() => {
        if (!isHolding) return;

        const tweenInfoFast = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        const inputFrameScaleFactor = inputType === Enum.ProximityPromptInputType.Touch ? 1.6 : 1.33;

        // Scale up input frame
        if (inputScaleRef.current) {
            TweenService.Create(inputScaleRef.current, tweenInfoFast, {
                Scale: inputFrameScaleFactor,
            }).Play();
        }

        // Shrink frame
        if (frameRef.current) {
            TweenService.Create(frameRef.current, tweenInfoFast, {
                Size: UDim2.fromScale(0.5, 1),
                BackgroundTransparency: 1,
                ImageTransparency: 1,
            }).Play();
        }
        setActionTextTransparency(1);
        setObjectTextTransparency(1);

        const startTime = os.clock();
        const holdDuration = prompt.HoldDuration;

        let connection: RBXScriptConnection | undefined;

        if (holdDuration > 0) {
            // Animate progress over time
            connection = RunService.Heartbeat.Connect(() => {
                const elapsed = os.clock() - startTime;
                const currentProgress = math.min(elapsed / holdDuration, 1);
                setProgress(currentProgress);

                if (currentProgress >= 1) {
                    // Hold completed, trigger the prompt
                    setIsHolding(false);
                    triggerPrompt();
                }
            });
        }

        return () => {
            connection?.Disconnect();

            // Scale down input frame
            if (inputScaleRef.current) {
                TweenService.Create(inputScaleRef.current, tweenInfoFast, {
                    Scale: 1,
                }).Play();
            }

            // Reset progress bar
            setProgress(0);

            // Restore frame
            if (frameRef.current) {
                TweenService.Create(frameRef.current, tweenInfoFast, {
                    Size: UDim2.fromScale(1, 1),
                    ImageTransparency: 0.2,
                }).Play();
            }
            setActionTextTransparency(0);
            setObjectTextTransparency(0);
        };
    }, [isHolding, prompt, inputType]);

    const triggerPrompt = () => {
        CustomProximityPrompt.trigger(prompt);

        const tweenInfoFast = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        setActionTextTransparency(0);
        setObjectTextTransparency(0);
        if (frameRef.current) {
            TweenService.Create(frameRef.current, tweenInfoFast, {
                Size: UDim2.fromScale(1, 1),
                ImageTransparency: 0.2,
            }).Play();
        }
    };

    // Handle keyboard/gamepad input for triggering prompts
    useEffect(() => {
        const handleInput = (input: InputObject) => {
            if (input.KeyCode !== prompt.GamepadKeyCode && input.KeyCode !== prompt.KeyboardKeyCode) return;

            if (input.UserInputState === Enum.UserInputState.Begin) {
                if (prompt.HoldDuration > 0) {
                    setIsHolding(true);
                    setHoldStartTime(os.clock());
                } else {
                    triggerPrompt();
                }
                return;
            }

            if (input.UserInputState === Enum.UserInputState.End) {
                setIsHolding(false);
            }
        };
        const inputBeganConnection = UserInputService.InputBegan.Connect(handleInput);
        const inputEndedConnection = UserInputService.InputEnded.Connect(handleInput);

        return () => {
            inputBeganConnection.Disconnect();
            inputEndedConnection.Disconnect();
        };
    }, [prompt, inputType]);

    // Calculate gradient rotations for circular progress
    const leftGradientRotation = math.clamp(progress * 360, 180, 360);
    const rightGradientRotation = math.clamp(progress * 360, 0, 180);

    // Handle touch/click input
    const handleInputBegan = (rbx: TextButton, input: InputObject) => {
        if (
            (input.UserInputType === Enum.UserInputType.Touch ||
                input.UserInputType === Enum.UserInputType.MouseButton1) &&
            input.UserInputState !== Enum.UserInputState.Change
        ) {
            if (prompt.HoldDuration > 0) {
                // Start holding
                setIsHolding(true);
                setHoldStartTime(os.clock());
            } else {
                // Instant trigger
                triggerPrompt();
            }
        }
    };

    const handleInputEnded = (rbx: TextButton, input: InputObject) => {
        if (
            input.UserInputType === Enum.UserInputType.Touch ||
            input.UserInputType === Enum.UserInputType.MouseButton1
        ) {
            // Stop holding
            setIsHolding(false);
        }
    };

    const isInteractive = inputType === Enum.ProximityPromptInputType.Touch || prompt.ClickablePrompt;

    return (
        <billboardgui
            Adornee={prompt.Parent as PVInstance}
            Active={isInteractive}
            AlwaysOnTop={true}
            ResetOnSpawn={false}
            Size={promptSize}
            SizeOffset={
                new Vector2(prompt.UIOffset.X / promptSize.Width.Offset, prompt.UIOffset.Y / promptSize.Height.Offset)
            }
            MaxDistance={prompt.MaxActivationDistance + 50}
        >
            {isInteractive && (
                <textbutton
                    BackgroundTransparency={1}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    TextTransparency={1}
                    Event={{
                        InputBegan: handleInputBegan,
                        InputEnded: handleInputEnded,
                    }}
                />
            )}
            <imagelabel
                ref={frameRef}
                BackgroundTransparency={1}
                Image={getAsset("assets/ProximityPromptFrame.png")}
                ImageTransparency={frameTransparency}
                Size={frameSize}
            >
                <frame
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                >
                    <frame
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                    >
                        <uiscale ref={inputScaleRef} Scale={inputScale} />
                        {/* Progress Bar */}
                        {prompt.HoldDuration > 0 && (
                            <frame
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                BackgroundTransparency={1}
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                Size={new UDim2(1, -14, 1, -14)}
                            >
                                {/* Left gradient */}
                                <frame
                                    BackgroundTransparency={1}
                                    ClipsDescendants={true}
                                    Size={new UDim2(0.5, 0, 1, 0)}
                                >
                                    <imagelabel
                                        BackgroundTransparency={1}
                                        Image="rbxasset://textures/ui/Controls/RadialFill.png"
                                        Size={new UDim2(2, 0, 1, 0)}
                                    >
                                        <uigradient
                                            Rotation={leftGradientRotation}
                                            Transparency={
                                                new NumberSequence([
                                                    new NumberSequenceKeypoint(0, 0),
                                                    new NumberSequenceKeypoint(0.4999, 0),
                                                    new NumberSequenceKeypoint(0.5, 1),
                                                    new NumberSequenceKeypoint(1, 1),
                                                ])
                                            }
                                        />
                                    </imagelabel>
                                </frame>
                                {/* Right gradient */}
                                <frame
                                    BackgroundTransparency={1}
                                    ClipsDescendants={true}
                                    Position={new UDim2(0.5, 0, 0, 0)}
                                    Size={new UDim2(0.5, 0, 1, 0)}
                                >
                                    <imagelabel
                                        BackgroundTransparency={1}
                                        Image="rbxasset://textures/ui/Controls/RadialFill.png"
                                        Position={new UDim2(-1, 0, 0, 0)}
                                        Size={new UDim2(2, 0, 1, 0)}
                                    >
                                        <uigradient
                                            Rotation={rightGradientRotation}
                                            Transparency={
                                                new NumberSequence([
                                                    new NumberSequenceKeypoint(0, 0),
                                                    new NumberSequenceKeypoint(0.4999, 0),
                                                    new NumberSequenceKeypoint(0.5, 1),
                                                    new NumberSequenceKeypoint(1, 1),
                                                ])
                                            }
                                        />
                                    </imagelabel>
                                </frame>
                            </frame>
                        )}
                        {/* Button background */}
                        <imagelabel
                            AnchorPoint={new Vector2(0.5, 0.5)}
                            BackgroundTransparency={0.5}
                            BorderColor3={Color3.fromRGB(27, 42, 53)}
                            Image="rbxasset://textures/ui/GuiImagePlaceholder.png"
                            ImageTransparency={1}
                            Position={new UDim2(0.5, 0, 0.5, 0)}
                            Size={new UDim2(1, -24, 1, -24)}
                        >
                            <uicorner CornerRadius={new UDim(0.5, 0)} />
                        </imagelabel>
                        {/* Button Image (keyboard background) */}
                        {showButtonImage && buttonImage !== undefined && (
                            <imagelabel
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                BackgroundTransparency={1}
                                Image={buttonImage}
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                Size={new UDim2(1, -44, 1, -42)}
                            />
                        )}
                        {showButtonImage && buttonImage === undefined && (
                            <imagelabel
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                BackgroundTransparency={1}
                                Image="rbxasset://textures/ui/Controls/key_single.png"
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                Size={new UDim2(1, -44, 1, -42)}
                            />
                        )}
                        {/* Button Icon (gamepad/keyboard icons) */}
                        {showButtonIcon && buttonIconImage !== undefined && (
                            <imagelabel
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                BackgroundTransparency={1}
                                Image={buttonIconImage}
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                Size={new UDim2(1, -48, 1, -48)}
                            />
                        )}
                        {/* Button Text (keyboard key label) */}
                        {showButtonText && buttonText !== undefined && (
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Position={new UDim2(0, 0, 0, -1)}
                                Size={new UDim2(1, 0, 1, 0)}
                                Text={buttonText}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextSize={buttonText.size() > 2 ? 12 : 14}
                            />
                        )}
                    </frame>
                </frame>
                {/* Object Text */}
                <textlabel
                    ref={objectTextRef}
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Position={objectTextPosition}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={objectText}
                    TextColor3={Color3.fromRGB(178, 178, 178)}
                    TextSize={14}
                    TextTransparency={objectTextTransparency}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    AutoLocalize={prompt.AutoLocalize}
                    RootLocalizationTable={prompt.RootLocalizationTable}
                />
                {/* Action Text */}
                <textlabel
                    ref={actionTextRef}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={actionTextPosition}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={actionText}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={19}
                    TextTransparency={actionTextTransparency}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    AutoLocalize={prompt.AutoLocalize}
                    RootLocalizationTable={prompt.RootLocalizationTable}
                />
            </imagelabel>
        </billboardgui>
    );
}

export function ProximityPromptGuiRenderer() {
    const [prompt, setPrompt] = useState<ProximityPrompt | undefined>();
    const [inputType, setInputType] = useState<Enum.ProximityPromptInputType>(Enum.ProximityPromptInputType.Keyboard);
    const [isVisible, setIsVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [shouldFadeIn, setShouldFadeIn] = useState(false);

    useEffect(() => {
        const prompts = new Set<ProximityPrompt>();
        const proximityPromptWorldNode = new WorldNode(
            "ProximityPrompt",
            (prompt) => {
                if (!prompt.IsA("ProximityPrompt")) return;
                prompts.add(prompt);
            },
            (prompt) => {
                if (!prompt.IsA("ProximityPrompt")) return;
                prompts.delete(prompt);
            },
        );

        if (IS_EDIT) {
            const intervalCleanup = simpleInterval(() => {
                const character = getPlayerCharacter();
                if (!character) return;

                // Find the closest prompt in range
                let closestPrompt: ProximityPrompt | undefined;
                let closestDistance = math.huge;

                const position = character.GetPivot().Position;
                for (const prompt of prompts) {
                    if (!prompt.Enabled || prompt.Parent === undefined || !prompt.Parent.IsA("PVInstance")) continue;
                    const distance = position.sub(prompt.Parent.GetPivot().Position).Magnitude;
                    if (distance < prompt.MaxActivationDistance && distance < closestDistance) {
                        closestPrompt = prompt;
                        closestDistance = distance;
                    }
                }

                if (closestPrompt !== prompt) {
                    if (closestPrompt) {
                        setPrompt(closestPrompt);
                        setIsVisible(true);
                        setIsFadingOut(false);
                        setShouldFadeIn(true);
                    } else {
                        // Start fade out animation
                        setIsFadingOut(true);
                        setShouldFadeIn(false);
                    }
                }
            }, 1);

            const inputTypeChangedConnection = UserInputService.LastInputTypeChanged.Connect((newInputType) => {
                if (newInputType === Enum.UserInputType.Touch || newInputType === Enum.UserInputType.Accelerometer) {
                    setInputType(Enum.ProximityPromptInputType.Touch);
                } else if (
                    newInputType === Enum.UserInputType.Gamepad1 ||
                    newInputType === Enum.UserInputType.Gamepad2 ||
                    newInputType === Enum.UserInputType.Gamepad3 ||
                    newInputType === Enum.UserInputType.Gamepad4
                ) {
                    setInputType(Enum.ProximityPromptInputType.Gamepad);
                } else {
                    setInputType(Enum.ProximityPromptInputType.Keyboard);
                }
            });

            return () => {
                proximityPromptWorldNode.cleanup();
                intervalCleanup();
                inputTypeChangedConnection.Disconnect();
            };
        }

        const promptServiceConnection = ProximityPromptService.PromptShown.Connect((prompt, inputType) => {
            setPrompt(prompt);
            setInputType(inputType);
            setIsVisible(true);
            setIsFadingOut(false);
            setShouldFadeIn(true);
        });

        const promptHiddenConnection = ProximityPromptService.PromptHidden.Connect(() => {
            // Start fade out animation instead of immediately hiding
            setIsFadingOut(true);
            setShouldFadeIn(false);
        });

        return () => {
            proximityPromptWorldNode.cleanup();
            promptServiceConnection.Disconnect();
            promptHiddenConnection.Disconnect();
        };
    });

    // Handle fade out animation completion
    useEffect(() => {
        if (!isFadingOut) return;

        // Wait for animations to complete before unmounting
        const fadeOutDuration = 0.2; // Match the tween duration
        task.wait(fadeOutDuration);

        setPrompt(undefined);
        setIsVisible(false);
        setIsFadingOut(false);
    }, [isFadingOut]);

    return prompt && isVisible ? (
        <ProximityPromptGui prompt={prompt} inputType={inputType} fadeOut={isFadingOut} fadeIn={shouldFadeIn} />
    ) : (
        <Fragment />
    );
}
