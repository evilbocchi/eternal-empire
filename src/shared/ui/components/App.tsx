import React, { StrictMode } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import BuildManager from "shared/ui/components/build/BuildManager";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

interface AppProps {
    /** Build controller interface for React integration */
    buildController?: BuildController;
}

export default function App({ buildController }: AppProps = {}) {
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
        <StrictMode>
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
                    <SidebarButtons />
                    <BuildManager
                        buildController={buildController}
                        animationsEnabled={settings.BuildAnimation}
                    />
                </TooltipProvider>
            </HotkeyProvider>
        </StrictMode>
    );
}