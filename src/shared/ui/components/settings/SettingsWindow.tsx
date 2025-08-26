import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import Packets from "shared/Packets";
import WindowCloseButton from "shared/ui/components/window/WindowCloseButton";
import WindowTitle from "shared/ui/components/window/WindowTitle";
import { RobotoMonoBold } from "shared/ui/GameFonts";
import HotkeyOption from "./HotkeyOption";
import SettingSection from "./SettingSection";
import SettingToggle from "./SettingToggle";

export interface SettingsWindowProps {
    visible?: boolean;
    settings: Settings;
    selectedHotkey?: string;
    onClose?: () => void;
    onSettingToggle?: (setting: keyof Settings, value: boolean) => void;
    onHotkeySelect?: (hotkeyName: string) => void;
    onHotkeyChange?: (hotkeyName: string, newKeyCode: Enum.KeyCode) => void;
    onHotkeyDeselect?: () => void;
}

export default function SettingsWindow({
    visible = false,
    settings,
    selectedHotkey,
    onClose,
    onSettingToggle,
    onHotkeySelect,
    onHotkeyChange,
    onHotkeyDeselect
}: SettingsWindowProps) {
    const hotkeys = settings.hotkeys;
    let sortedHotkeys = new Array<{ name: string, key: number; }>();
    for (const [name, key] of pairs(hotkeys)) // TODO: Implement sorting
        sortedHotkeys.push({ name: tostring(name), key });

    // Handle hotkey change with proper integration
    const handleHotkeyChange = (hotkeyName: string, newKeyCode: Enum.KeyCode) => {
        // Inform the server about the hotkey change
        Packets.setHotkey.inform(hotkeyName, newKeyCode.Value);

        // Call the provided callback if available
        onHotkeyChange?.(hotkeyName, newKeyCode);
    };

    return (
        <frame
            key="Settings"
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(13, 13, 13)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            Selectable={true}
            Size={new UDim2(0.9, 0, 0.9, -50)}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Visible={visible}
        >
            <uisizeconstraint
                MaxSize={new Vector2(800, 600)}
            />
            <WindowTitle icon={getAsset("assets/Settings.png")} title="Settings" font={RobotoMonoBold} />
            <WindowCloseButton onClick={() => onClose?.()} />
            <scrollingframe
                key="InteractionOptions"
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                ScrollBarThickness={6}
                Selectable={false}
                Size={new UDim2(0.8, 0, 0.9, 0)}
            >
                <uilistlayout Padding={new UDim(0, 9)} SortOrder={Enum.SortOrder.LayoutOrder} />
                <uipadding PaddingRight={new UDim(0, 5)} />

                {/* General Section */}
                <SettingSection title="General" layoutOrder={-50} />

                <SettingToggle
                    title="Scientific Notation"
                    enabled={settings.ScientificNotation}
                    layoutOrder={-3}
                    onToggle={(enabled) => onSettingToggle?.("ScientificNotation", enabled)}
                />

                <SettingToggle
                    title="Format Currencies"
                    subtitle="This is forcefully disabled on smaller screens."
                    enabled={settings.FormatCurrencies}
                    layoutOrder={-1}
                    onToggle={(enabled) => onSettingToggle?.("FormatCurrencies", enabled)}
                />

                <SettingToggle
                    title="Music"
                    enabled={settings.Music}
                    layoutOrder={-5}
                    onToggle={(enabled) => onSettingToggle?.("Music", enabled)}
                />

                <SettingToggle
                    title="Sound Effects"
                    enabled={settings.SoundEffects}
                    layoutOrder={-5}
                    onToggle={(enabled) => onSettingToggle?.("SoundEffects", enabled)}
                />

                {/* Controls Section */}
                <SettingSection title="Controls" layoutOrder={100} />

                <SettingToggle
                    title="Reset Layer Animations"
                    enabled={settings.ResetAnimation}
                    layoutOrder={1}
                    onToggle={(enabled) => onSettingToggle?.("ResetAnimation", enabled)}
                />

                <SettingToggle
                    title="Build Animations"
                    enabled={settings.BuildAnimation}
                    layoutOrder={2}
                    onToggle={(enabled) => onSettingToggle?.("BuildAnimation", enabled)}
                />

                <SettingToggle
                    title="Currency Gain Animations"
                    enabled={settings.CurrencyGainAnimation}
                    layoutOrder={2}
                    onToggle={(enabled) => onSettingToggle?.("CurrencyGainAnimation", enabled)}
                />

                {/* Layout Section */}
                <SettingSection title="Layout" layoutOrder={20} />

                <SettingToggle
                    title="Hide Maxed Items"
                    enabled={settings.HideMaxedItems}
                    layoutOrder={22}
                    onToggle={(enabled) => onSettingToggle?.("HideMaxedItems", enabled)}
                />

                {/* Performance Section */}
                <SettingSection title="Performance" layoutOrder={50} />

                <SettingToggle
                    title="Item Shadows"
                    subtitle="Items may need to be placed again to apply changes."
                    enabled={settings.ItemShadows}
                    layoutOrder={51}
                    onToggle={(enabled) => onSettingToggle?.("ItemShadows", enabled)}
                />

                {/* Hotkeys */}
                {sortedHotkeys.map((hotkey, index) => (
                    <HotkeyOption
                        key={hotkey.name}
                        title={hotkey.name}
                        keyText={Enum.KeyCode.FromValue(hotkey.key)?.Name ?? "?"}
                        layoutOrder={index + 100}
                        isSelected={selectedHotkey === hotkey.name}
                        onSelect={() => onHotkeySelect?.(hotkey.name)}
                        onHotkeyChange={(newKeyCode) => handleHotkeyChange(hotkey.name, newKeyCode)}
                        onDeselect={() => onHotkeyDeselect?.()}
                    />
                ))}
            </scrollingframe>
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} />
        </frame>
    );
}
