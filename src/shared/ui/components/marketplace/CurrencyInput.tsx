import React, { useState } from "@rbxts/react";
import { RobotoSlab, RobotoSlabBold } from "shared/ui/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import CurrencyDisplay from "./CurrencyDisplay";

interface CurrencyInputProps {
    label: string;
    placeholder?: string;
    onAmountChange: (amount: CurrencyBundle) => void;
    currencyType?: string;
    minValue?: number;
    maxValue?: number;
    size?: UDim2;
}

/**
 * Component for inputting currency amounts with validation and formatting.
 */
export default function CurrencyInput({
    label,
    placeholder = "Enter amount...",
    onAmountChange,
    currencyType = "Funds",
    minValue = 1,
    maxValue = 1e12,
    size = new UDim2(1, 0, 0, 80)
}: CurrencyInputProps) {

    const [inputText, setInputText] = useState("");
    const [isValid, setIsValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const validateInput = (text: string): boolean => {
        if (text === "") {
            setErrorMessage("");
            setIsValid(true);
            return false;
        }

        const amount = tonumber(text);
        if (!amount) {
            setErrorMessage("Please enter a valid number");
            setIsValid(false);
            return false;
        }

        if (amount < minValue) {
            setErrorMessage(`Minimum amount is ${minValue}`);
            setIsValid(false);
            return false;
        }

        if (amount > maxValue) {
            setErrorMessage(`Maximum amount is ${maxValue}`);
            setIsValid(false);
            return false;
        }

        setErrorMessage("");
        setIsValid(true);
        return true;
    };

    const handleTextChange = (text: string) => {
        setInputText(text);

        if (validateInput(text)) {
            const amount = tonumber(text)!;
            const currencyBundle = new CurrencyBundle();
            // Note: You'd need to implement the proper way to set currency in CurrencyBundle
            // This is a simplified example
            onAmountChange(currencyBundle);
        }
    };

    const formatNumber = (input: string): string => {
        // Remove any non-numeric characters except decimal points
        const cleaned = input.gsub("[^%d%.]", "")[0];
        const parts = string.split(cleaned, ".");

        if (parts.size() > 2) {
            // Only allow one decimal point
            return parts[0] + "." + parts[1];
        }

        return cleaned;
    };

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(50, 50, 50)}
            BorderSizePixel={0}
            Size={size}
        >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uistroke
                Thickness={1}
                Color={isValid ? Color3.fromRGB(100, 100, 100) : Color3.fromRGB(200, 100, 100)}
            />

            {/* Label */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Size={new UDim2(1, 0, 0, 20)}
                Position={new UDim2(0, 10, 0, 5)}
                Text={label}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={1} />
            </textlabel>

            {/* Input Field */}
            <textbox
                BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                BorderSizePixel={0}
                Size={new UDim2(1, -20, 0, 35)}
                Position={new UDim2(0, 10, 0, 25)}
                Text={inputText}
                PlaceholderText={placeholder}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                FontFace={RobotoSlab}
                ClearTextOnFocus={false}
                Event={{
                    FocusLost: (textBox) => {
                        const formatted = formatNumber(textBox.Text);
                        textBox.Text = formatted;
                        handleTextChange(formatted);
                    }
                }}
            >
                <uicorner CornerRadius={new UDim(0, 4)} />
                <uistroke
                    Thickness={1}
                    Color={isValid ? Color3.fromRGB(100, 100, 100) : Color3.fromRGB(200, 100, 100)}
                />
            </textbox>

            {/* Error Message */}
            {!isValid && errorMessage !== "" && (
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Size={new UDim2(1, -20, 0, 15)}
                    Position={new UDim2(0, 10, 0, 65)}
                    Text={errorMessage}
                    TextColor3={Color3.fromRGB(255, 100, 100)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
            )}
        </frame>
    );
}