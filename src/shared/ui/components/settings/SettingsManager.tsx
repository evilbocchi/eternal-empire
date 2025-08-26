import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { useToggleHotkey } from "shared/ui/components/hotkeys/useHotkeyWithTooltip";
import IconButton from "shared/ui/components/IconButton";
import SettingsWindow, { SettingsWindowProps } from "shared/ui/components/settings/SettingsWindow";
import { useTooltipProps } from "shared/ui/components/tooltip/useTooltipProps";

interface SettingsManagerProps extends SettingsWindowProps {

}

export function SettingsButton({ onClick }: { onClick: () => void; }) {
    // Add tooltip with hotkey information
    const tooltipProps = useTooltipProps({ message: "Settings (P)" });

    return (
        <IconButton
            image={getAsset("assets/Settings.png")}
            onClick={onClick}
            buttonProps={{
                AnchorPoint: new Vector2(0, 1),
                Size: new UDim2(0, 35, 0.5, 0),
                Position: new UDim2(0, 4, 1, -4)
            }}
            {...tooltipProps}
        />
    );
}

export default function SettingsManager(props: SettingsManagerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [shouldClose, setShouldClose] = React.useState(false);

    const handleToggle = () => {
        if (isOpen) {
            playSound("MenuClose.mp3");
            setShouldClose(true);
        } else {
            playSound("MenuOpen.mp3");
            setIsOpen(true);
            setShouldClose(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setShouldClose(false);
    };

    // Bind the P key to toggle settings
    useToggleHotkey(
        Enum.KeyCode.P,
        isOpen,
        handleToggle,
        {
            priority: 10, // High priority for settings
            enabled: true,
            label: "Settings"
        }
    );

    return (<frame
        key='SettingsManager'
        BackgroundTransparency={1}
        Size={new UDim2(1, 0, 1, 0)}
    >
        <SettingsWindow
            onClose={handleClose}
            visible={isOpen}
            shouldClose={shouldClose}
            {...props}
        />
        <SettingsButton onClick={handleToggle} />
    </frame>);
}