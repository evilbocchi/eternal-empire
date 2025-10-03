import React, { useEffect, useRef, useState, useBinding } from "@rbxts/react";
import { RobotoSlabMedium } from "shared/asset/GameFonts";

const UserInputService = game.GetService("UserInputService");
const TweenService = game.GetService("TweenService");
const TextService = game.GetService("TextService");

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
interface ProximityPromptGuiProps {
    prompt: ProximityPrompt;
    inputType: Enum.ProximityPromptInputType;
}

// TODO implement this

export default function ProximityPromptGui({ prompt, inputType }: ProximityPromptGuiProps) {
    const [progress, setProgress] = useState(0);
    const [frameSize, setFrameSize] = useState(UDim2.fromScale(1, 1));
    const [frameTransparency, setFrameTransparency] = useState(0.2);
    const [frameImageTransparency, setFrameImageTransparency] = useState(1);
    const [inputScale, setInputScale] = useState(1);
    const [actionTextTransparency, setActionTextTransparency] = useState(0);
    const [objectTextTransparency, setObjectTextTransparency] = useState(0);
    const [promptSize, setPromptSize] = useState(new UDim2(0, 193, 0, 72));
    const [actionTextPosition, setActionTextPosition] = useState(new UDim2(0.5, -24, 0, 9));
    const [objectTextPosition, setObjectTextPosition] = useState(new UDim2(0.5, -24, 0, -10));
    const [actionText, setActionText] = useState(prompt.ActionText);
    const [objectText, setObjectText] = useState(prompt.ObjectText);

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
    const progressRef = useRef<NumberValue>();

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

    useEffect(() => {
        // Tween info configurations
        const tweenInfoFast = new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        const tweenInfoInFullDuration = new TweenInfo(
            prompt.HoldDuration,
            Enum.EasingStyle.Linear,
            Enum.EasingDirection.Out,
        );
        const tweenInfoInstant = new TweenInfo(0, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);

        const inputFrameScaleFactor = inputType === Enum.ProximityPromptInputType.Touch ? 1.6 : 1.33;

        // Handle PromptButtonHoldBegan
        let holdBeganConnection: RBXScriptConnection | undefined;
        let holdEndedConnection: RBXScriptConnection | undefined;

        if (prompt.HoldDuration > 0) {
            holdBeganConnection = prompt.PromptButtonHoldBegan.Connect(() => {
                // Scale up input frame
                if (inputScaleRef.current) {
                    TweenService.Create(inputScaleRef.current, tweenInfoFast, {
                        Scale: inputFrameScaleFactor,
                    } as never).Play();
                }

                // Animate progress bar
                if (progressRef.current) {
                    TweenService.Create(progressRef.current, tweenInfoInFullDuration, { Value: 1 } as never).Play();
                }

                // Shrink frame
                if (frameRef.current) {
                    TweenService.Create(frameRef.current, tweenInfoFast, {
                        Size: UDim2.fromScale(0.5, 1),
                        BackgroundTransparency: 1,
                        ImageTransparency: 1,
                    } as never).Play();
                }
            });

            holdEndedConnection = prompt.PromptButtonHoldEnded.Connect(() => {
                // Scale down input frame
                if (inputScaleRef.current) {
                    TweenService.Create(inputScaleRef.current, tweenInfoFast, {
                        Scale: 1,
                    } as never).Play();
                }

                // Reset progress bar
                if (progressRef.current) {
                    TweenService.Create(progressRef.current, tweenInfoInstant, {
                        Value: 0,
                    } as never).Play();
                }

                // Restore frame
                if (frameRef.current) {
                    TweenService.Create(frameRef.current, tweenInfoFast, {
                        Size: UDim2.fromScale(1, 1),
                        BackgroundTransparency: 0.2,
                        ImageTransparency: 1,
                    } as never).Play();
                }
            });
        }

        // Handle Triggered (fade out)
        const triggeredConnection = prompt.Triggered.Connect(() => {
            if (frameRef.current) {
                TweenService.Create(frameRef.current, tweenInfoFast, {
                    Size: UDim2.fromScale(0.5, 1),
                    BackgroundTransparency: 1,
                    ImageTransparency: 1,
                } as never).Play();
            }
            setActionTextTransparency(1);
            setObjectTextTransparency(1);
        });

        // Handle TriggerEnded (fade in)
        const triggerEndedConnection = prompt.TriggerEnded.Connect(() => {
            if (frameRef.current) {
                TweenService.Create(frameRef.current, tweenInfoFast, {
                    Size: UDim2.fromScale(1, 1),
                    BackgroundTransparency: 0.2,
                    ImageTransparency: 1,
                } as never).Play();
            }
            setActionTextTransparency(0);
            setObjectTextTransparency(0);
        });

        // Fade in on mount
        if (frameRef.current) {
            TweenService.Create(frameRef.current, tweenInfoFast, {
                Size: UDim2.fromScale(1, 1),
                BackgroundTransparency: 0.2,
                ImageTransparency: 1,
            } as never).Play();
        }
        setActionTextTransparency(0);
        setObjectTextTransparency(0);

        return () => {
            holdBeganConnection?.Disconnect();
            holdEndedConnection?.Disconnect();
            triggeredConnection.Disconnect();
            triggerEndedConnection.Disconnect();
        };
    }, [prompt, inputType]);

    // Setup circular progress bar
    useEffect(() => {
        if (!progressRef.current) return;

        const progressValue = progressRef.current;
        const connection = progressValue.Changed.Connect((value) => {
            setProgress(value);
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

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
            prompt.InputHoldBegin();
        }
    };

    const handleInputEnded = (rbx: TextButton, input: InputObject) => {
        if (
            input.UserInputType === Enum.UserInputType.Touch ||
            input.UserInputType === Enum.UserInputType.MouseButton1
        ) {
            prompt.InputHoldEnd();
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
                BackgroundColor3={Color3.fromRGB(18, 18, 18)}
                BackgroundTransparency={frameTransparency}
                Image="rbxasset://textures/ui/GuiImagePlaceholder.png"
                ImageTransparency={frameImageTransparency}
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
                                                    new NumberSequenceKeypoint(0, 0, 0),
                                                    new NumberSequenceKeypoint(0.5, 0, 0),
                                                    new NumberSequenceKeypoint(0.5, 1, 0),
                                                    new NumberSequenceKeypoint(1, 1, 0),
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
                                                    new NumberSequenceKeypoint(0, 0, 0),
                                                    new NumberSequenceKeypoint(0.5, 0, 0),
                                                    new NumberSequenceKeypoint(0.5, 1, 0),
                                                    new NumberSequenceKeypoint(1, 1, 0),
                                                ])
                                            }
                                        />
                                    </imagelabel>
                                </frame>
                                {/* Hidden NumberValue for tween target */}
                                <numbervalue ref={progressRef} Value={0} />
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
                                FontFace={RobotoSlabMedium}
                                Position={new UDim2(0, 0, 0, -1)}
                                Size={new UDim2(1, 0, 1, 0)}
                                Text={buttonText}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextSize={buttonText.size() > 2 ? 12 : 14}
                            />
                        )}
                    </frame>
                </frame>
                <uicorner />
                {/* Action Text */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
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
                {/* Object Text */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
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
            </imagelabel>
        </billboardgui>
    );
}
