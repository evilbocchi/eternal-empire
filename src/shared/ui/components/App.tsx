import React, { StrictMode } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import Packets from "shared/Packets";
import BuildManager from "shared/ui/components/build/BuildManager";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import PositionDisplay from "shared/ui/components/position/PositionDisplay";
import TrackedQuestWindow from "shared/ui/components/quest/TrackedQuestWindow";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

interface AppProps {
    /** Build controller interface for React integration */
    buildController?: BuildController;
}

export default function App({ buildController }: AppProps = {}) {
    const [settings, setSettings] = React.useState(Packets.settings.get()!);

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
                    <PositionDisplay />
                    <TrackedQuestWindow />
                    <BuildManager
                        buildController={buildController}
                        animationsEnabled={settings.BuildAnimation}
                    />
                </TooltipProvider>
            </HotkeyProvider>
        </StrictMode>
    );
}