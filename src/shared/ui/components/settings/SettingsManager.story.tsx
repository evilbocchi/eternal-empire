import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

const controls = {
    visible: true
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: typeof controls) => {
        const defaultSettings = table.clone(PlayerProfileTemplate.settings);
        defaultSettings.hotkeys = {
            "Toggle Settings": Enum.KeyCode.P.Value,
            "Toggle Inventory": Enum.KeyCode.B.Value,
            "Quick Build": Enum.KeyCode.Q.Value,
            "Toggle Music": Enum.KeyCode.M.Value
        };

        const [settings, setSettings] = React.useState(defaultSettings);

        const [selectedHotkey, setSelectedHotkey] = React.useState<string | undefined>();

        const handleSettingToggle = (setting: keyof typeof settings, value: boolean) => {
            setSettings(prev => ({ ...prev, [setting]: value }));
        };

        const handleHotkeySelect = (hotkeyName: string) => {
            setSelectedHotkey(prev => prev === hotkeyName ? undefined : hotkeyName);
        };

        const handleHotkeyDeselect = () => {
            setSelectedHotkey(undefined);
        };

        const handleHotkeyChange = (hotkeyName: string, newKeyCode: Enum.KeyCode) => {
            setSettings(prev => ({
                ...prev,
                hotkeys: {
                    ...prev.hotkeys,
                    [hotkeyName]: newKeyCode.Value
                }
            }));
            // Auto-deselect after changing hotkey
            setSelectedHotkey(undefined);
        };

        return (
            <HotkeyProvider defaultEnabled={true}>
                <TooltipProvider>
                    <SettingsManager
                        settings={settings}
                        selectedHotkey={selectedHotkey}
                        onSettingToggle={handleSettingToggle}
                        onHotkeySelect={handleHotkeySelect}
                        onHotkeyChange={handleHotkeyChange}
                        onHotkeyDeselect={handleHotkeyDeselect}
                    />
                </TooltipProvider>
            </HotkeyProvider>
        );
    }
};
