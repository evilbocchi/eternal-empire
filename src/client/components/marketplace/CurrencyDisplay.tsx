import React from "@rbxts/react";
import { RobotoSlab } from "shared/asset/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";

interface CurrencyDisplayProps {
    currencyBundle: CurrencyBundle;
    size?: UDim2;
    textColor?: Color3;
    showIcon?: boolean;
}

/**
 * Component for displaying currency amounts with proper formatting and icons.
 */
export default function CurrencyDisplay({
    currencyBundle,
    size = new UDim2(1, 0, 1, 0),
    textColor = Color3.fromRGB(255, 255, 255),
    showIcon = true,
}: CurrencyDisplayProps) {
    const formatCurrencyAmount = (amount: number): string => {
        if (amount >= 1e12) {
            return `${math.floor(amount / 1e11) / 10}T`;
        } else if (amount >= 1e9) {
            return `${math.floor(amount / 1e8) / 10}B`;
        } else if (amount >= 1e6) {
            return `${math.floor(amount / 1e5) / 10}M`;
        } else if (amount >= 1e3) {
            return `${math.floor(amount / 1e2) / 10}K`;
        }
        return tostring(math.floor(amount));
    };

    const getCurrencyIcon = (currencyType: string): string => {
        // Return appropriate currency icon based on type
        switch (currencyType) {
            case "Funds":
                return "💰";
            case "Power":
                return "⚡";
            case "Skill":
                return "🎯";
            case "Wins":
                return "🏆";
            default:
                return "💎";
        }
    };

    const getCurrencyColor = (currencyType: string): Color3 => {
        switch (currencyType) {
            case "Funds":
                return Color3.fromRGB(255, 215, 0); // Gold
            case "Power":
                return Color3.fromRGB(255, 100, 100); // Red
            case "Skill":
                return Color3.fromRGB(100, 255, 100); // Green
            case "Wins":
                return Color3.fromRGB(100, 100, 255); // Blue
            default:
                return Color3.fromRGB(255, 255, 255); // White
        }
    };

    // Get the first currency for display (most marketplace items use single currency)
    const [currencyType, amount] = currencyBundle.getFirst();

    if (!currencyType || !amount) {
        return (
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Size={size}
                Text="Free"
                TextColor3={textColor}
                TextScaled={true}
            >
                <uistroke Thickness={1} />
            </textlabel>
        );
    }

    const amountNumber = tonumber(tostring(amount)) || 0;
    const displayText = showIcon
        ? `${getCurrencyIcon(currencyType)} ${formatCurrencyAmount(amountNumber)}`
        : formatCurrencyAmount(amountNumber);

    return (
        <textlabel
            BackgroundTransparency={1}
            FontFace={RobotoSlab}
            Size={size}
            Text={displayText}
            TextColor3={getCurrencyColor(currencyType)}
            TextScaled={true}
        >
            <uistroke Thickness={1} />
        </textlabel>
    );
}
