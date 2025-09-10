import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";

interface EmpireNameInputProps {
    prefix: string;
    initialValue: string;
    onTextChanged: (text: string) => void;
    maxLength?: number;
    minLength?: number;
}

/**
 * Empire name input component with prefix display and validation
 */
export default function EmpireNameInput({
    prefix,
    initialValue,
    onTextChanged,
    maxLength = 16,
    minLength = 5,
}: EmpireNameInputProps) {
    const [text, setText] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);
    const textBoxRef = useRef<TextBox>();

    const isValid = text.size() >= minLength && text.size() <= maxLength;
    const characterCount = text.size();

    const handleTextChanged = useCallback(
        (newText: string) => {
            // Sanitize input - only allow alphanumeric, underscore, and space
            const [sanitized] = newText.gsub("[^%w_ ]", "");
            const truncated = sanitized.sub(1, maxLength);
            setText(truncated);
            onTextChanged(truncated);
        },
        [maxLength, onTextChanged],
    );

    const handleFocused = useCallback(() => {
        setIsFocused(true);
        const textBox = textBoxRef.current;
        if (textBox) {
            const tween = TweenService.Create(textBox, new TweenInfo(0.2), {
                BackgroundTransparency: 0.5,
            });
            tween.Play();
        }
    }, []);

    const handleFocusLost = useCallback(() => {
        setIsFocused(false);
        const textBox = textBoxRef.current;
        if (textBox) {
            const tween = TweenService.Create(textBox, new TweenInfo(0.2), {
                BackgroundTransparency: 0.7,
            });
            tween.Play();
        }
    }, []);

    // Update text when initialValue changes
    useEffect(() => {
        setText(initialValue);
    }, [initialValue]);

    // Listen for text changes
    useEffect(() => {
        const textBox = textBoxRef.current;
        if (!textBox) return;

        const connection = textBox.GetPropertyChangedSignal("Text").Connect(() => {
            const newText = textBox.Text;
            handleTextChanged(newText);
        });

        return () => connection.Disconnect();
    }, [handleTextChanged]);

    const borderColor = isFocused
        ? isValid
            ? Color3.fromRGB(100, 180, 255) // Blue when focused and valid
            : Color3.fromRGB(255, 120, 120) // Red when focused and invalid
        : Color3.fromRGB(100, 100, 110); // Gray when not focused

    const textColor = isValid ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 180, 180);
    const backgroundColor = isFocused ? Color3.fromRGB(35, 35, 45) : Color3.fromRGB(25, 25, 35);

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0, 50)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 12)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Prefix label */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(0, 200, 0.8, 0)}
                Text={prefix}
                TextColor3={Color3.fromRGB(220, 220, 230)}
                TextScaled={true}
                TextSize={22}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Right}
                LayoutOrder={1}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} />
            </textlabel>

            {/* Text input container */}
            <frame
                BackgroundColor3={backgroundColor}
                BackgroundTransparency={1}
                BorderSizePixel={0}
                Size={new UDim2(0, 250, 1, 0)}
                LayoutOrder={2}
            >
                <uicorner CornerRadius={new UDim(0, 10)} />
                <uistroke Color={borderColor} Thickness={2} ApplyStrokeMode={Enum.ApplyStrokeMode.Border} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, backgroundColor),
                            new ColorSequenceKeypoint(1, backgroundColor.Lerp(Color3.fromRGB(0, 0, 0), 0.2)),
                        ])
                    }
                    Rotation={90}
                />

                {/* Text input box */}
                <textbox
                    ref={textBoxRef}
                    BackgroundTransparency={1}
                    BorderSizePixel={0}
                    ClearTextOnFocus={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={text}
                    TextColor3={textColor}
                    TextSize={20}
                    FontFace={RobotoSlab}
                    TextWrapped={true}
                    PlaceholderText="Enter empire name..."
                    PlaceholderColor3={Color3.fromRGB(120, 120, 130)}
                    Event={{
                        Focused: handleFocused,
                        FocusLost: handleFocusLost,
                    }}
                >
                    <uicorner CornerRadius={new UDim(0, 10)} />
                    <uipadding
                        PaddingLeft={new UDim(0, 12)}
                        PaddingRight={new UDim(0, 12)}
                        PaddingTop={new UDim(0, 6)}
                        PaddingBottom={new UDim(0, 6)}
                    />
                </textbox>
            </frame>

            {/* Character counter */}
            <frame
                BackgroundColor3={Color3.fromRGB(20, 20, 25)}
                BackgroundTransparency={0.2}
                BorderSizePixel={0}
                Size={new UDim2(0, 60, 0.7, 0)}
                LayoutOrder={3}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
                <uistroke
                    Color={isValid ? Color3.fromRGB(100, 180, 255) : Color3.fromRGB(255, 120, 120)}
                    Thickness={1}
                />

                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, -6, 1, -6)}
                    Text={`${characterCount}/${maxLength}`}
                    TextColor3={isValid ? Color3.fromRGB(180, 220, 255) : Color3.fromRGB(255, 150, 150)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1} />
                </textlabel>
            </frame>
        </frame>
    );
}
