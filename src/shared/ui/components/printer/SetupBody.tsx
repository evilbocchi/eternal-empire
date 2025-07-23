import React from "@rbxts/react";
import ActionButton from "shared/ui/components/printer/ActionButton";
import ToggleSwitch from "shared/ui/components/printer/ToggleSwitch";

interface SetupBodyProps {
    isAutoloadEnabled: boolean;
    onSave?: () => void;
    onLoad?: () => void;
    onToggleAutoload?: () => void;
}

function SetupBody({ onSave, onLoad, onToggleAutoload }: SetupBodyProps) {
    return (
        <frame key="Body" BackgroundTransparency={1} Size={new UDim2(1, 0, 0.66, 0)}>
            <ActionButton
                text="Save"
                backgroundColor={Color3.fromRGB(170, 255, 127)}
                onClick={onSave}
            />
            <ActionButton
                text="Load"
                backgroundColor={Color3.fromRGB(255, 170, 0)}
                layoutOrder={1}
                onClick={onLoad}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0.025, 0)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <ToggleSwitch
                label="Alert when affordable"
                onToggle={onToggleAutoload}
            />
        </frame>
    );
}

export default SetupBody;
