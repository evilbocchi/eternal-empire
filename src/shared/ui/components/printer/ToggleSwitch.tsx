import React from "@rbxts/react";
import { RobotoSlab } from "shared/ui/GameFonts";

interface ToggleSwitchProps {
    label: string;
    isEnabled: boolean;
    onToggle?: () => void;
}

function ToggleSwitch({ label, isEnabled, onToggle }: ToggleSwitchProps) {
    const toggleColor = isEnabled ? Color3.fromRGB(127, 255, 127) : Color3.fromRGB(255, 79, 79);
    const togglePosition = isEnabled ? new UDim2(1, -4, 0.5, 0) : new UDim2(0, 4, 0.5, 0);
    const toggleAnchor = isEnabled ? new Vector2(1, 0.5) : new Vector2(0, 0.5);

    return (
        <frame
            key="ToggleContainer"
            BackgroundTransparency={1}
            LayoutOrder={-5}
            Size={new UDim2(0.4, 0, 1, 0)}
        >
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Size={new UDim2(1, 0, 0.35, 0)}
                Text={label}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <textbutton
                key="ToggleButton"
                BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                BorderSizePixel={0}
                Font={Enum.Font.SourceSans}
                LayoutOrder={5}
                Size={new UDim2(0.4, 0, 0.25, 0)}
                Text={""}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={14}
                Event={{
                    Activated: onToggle
                }}
            >
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                <frame
                    AnchorPoint={toggleAnchor}
                    BackgroundColor3={toggleColor}
                    BorderSizePixel={0}
                    Position={togglePosition}
                    Size={new UDim2(0.3, 0, 0.8, -2)}
                >
                    <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                </frame>
            </textbutton>
        </frame>
    );
}

export default ToggleSwitch;
