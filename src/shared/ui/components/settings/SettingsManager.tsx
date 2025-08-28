import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import { useHotkeyWithTooltip, useToggleHotkey } from "shared/ui/components/hotkeys/useHotkeyWithTooltip";
import IconButton from "shared/ui/components/IconButton";
import SettingsWindow, { SettingsWindowProps } from "shared/ui/components/settings/SettingsWindow";

interface SettingsManagerProps extends SettingsWindowProps {

}

export function SettingsButton({ tooltipProps }: { tooltipProps: ReturnType<typeof useHotkeyWithTooltip>; }) {
    return (
        <IconButton
            image={getAsset("assets/Settings.png")}
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
    const [selectedHotkey, setSelectedHotkey] = React.useState<string | undefined>();

    props.settings = Packets.settings.get()!;
    props.onSettingToggle ??= (setting, value) => Packets.setSetting.toServer(setting, value);

    props.onHotkeySelect ??= (hotkeyName: string) => {
        setSelectedHotkey(prev => prev === hotkeyName ? undefined : hotkeyName);
    };

    props.onHotkeyDeselect ??= () => {
        setSelectedHotkey(undefined);
    };

    props.onHotkeyChange ??= (hotkeyName: string, newKeyCode: Enum.KeyCode) => {
        Packets.setHotkey.toServer(hotkeyName, newKeyCode.Value);
        setSelectedHotkey(undefined);
    };

    const handleToggle = () => {
        if (isOpen) {
            playSound("MenuClose.mp3");
            setIsOpen(false);
        } else {
            playSound("MenuOpen.mp3");
            setIsOpen(true);
        }
    };

    // Bind the P key to toggle settings
    const tooltipProps = useToggleHotkey(
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
            visible={isOpen}
            onClose={() => setIsOpen(false)}
            {...props}
        />
        <SettingsButton tooltipProps={tooltipProps} />
    </frame>);
}