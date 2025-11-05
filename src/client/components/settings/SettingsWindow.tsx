import React, { JSX, useCallback, useEffect, useState } from "@rbxts/react";
import SerikaNum from "@rbxts/serikanum";
import HotkeyManager, { HOTKEY_BINDINGS } from "client/components/hotkeys/HotkeyManager";
import useHotkeyWithTooltip from "client/components/hotkeys/useHotkeyWithTooltip";
import IconButton from "client/components/IconButton";
import HotkeyOption from "client/components/settings/HotkeyOption";
import SettingSection from "client/components/settings/SettingSection";
import SettingToggle from "client/components/settings/SettingToggle";
import SingleDocumentManager from "client/components/sidebar/SingleDocumentManager";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";
import Packets from "shared/Packets";

export function SettingsButton() {
    const tooltipProps = useHotkeyWithTooltip({
        action: () => {
            SingleDocumentManager.toggle("Settings");
            return true;
        },
        label: "Settings",
    });

    return (
        <IconButton
            image={getAsset("assets/Settings.png")}
            buttonProps={{
                AnchorPoint: new Vector2(0, 1),
                Size: new UDim2(0, 35, 0.5, 0),
                Position: new UDim2(0, 4, 1, -4),
            }}
            {...tooltipProps}
        />
    );
}

export default function SettingsWindow() {
    const { id, visible } = useSingleDocument({ id: "Settings", priority: 10 });
    const [selectedHotkey, setSelectedHotkey] = useState<string | undefined>();
    const [settings, setSettings] = useState(Packets.settings.get());

    useEffect(() => {
        const connection = Packets.settings.observe((newSettings) => {
            SerikaNum.changeDefaultAbbreviation(newSettings.ScientificNotation === true ? "scientific" : "suffix");
            setSettings(newSettings);
        });
        return () => connection.disconnect();
    }, []);

    // Cleanup hotkey setting state when component unmounts or window closes
    useEffect(() => {
        if (!visible && selectedHotkey !== undefined) {
            setSelectedHotkey(undefined);
            HotkeyManager.setIsSettingHotkey(false);
        }
    }, [visible]);

    const onHotkeySelect = useCallback(
        (hotkeyName: string) => {
            const newSelected = selectedHotkey === hotkeyName ? undefined : hotkeyName;
            setSelectedHotkey(newSelected);
            HotkeyManager.setIsSettingHotkey(newSelected !== undefined);
        },
        [selectedHotkey],
    );

    const onHotkeyDeselect = useCallback(() => {
        setSelectedHotkey(undefined);
        HotkeyManager.setIsSettingHotkey(false);
    }, []);

    const handleHotkeyChange = useCallback(
        (label: string, keyCode: Enum.KeyCode) => {
            Packets.setHotkey.toServer(label, keyCode.Value);
            setSelectedHotkey(undefined);
            task.delay(0.5, () => HotkeyManager.setIsSettingHotkey(false)); // Slight delay to avoid immediate re-trigger
        },
        [setSelectedHotkey],
    );

    const hotkeyOptions = new Array<JSX.Element>();
    for (const binding of HOTKEY_BINDINGS) {
        const label = binding.label;
        const value = settings.hotkeys[label];
        const keyText = value !== undefined ? Enum.KeyCode.FromValue(value)?.Name : binding.keyCode.Name;
        hotkeyOptions.push(
            <HotkeyOption
                key={label}
                title={label}
                keyText={keyText ?? "?"}
                isSelected={selectedHotkey === label}
                onSelect={() => onHotkeySelect?.(label)}
                onHotkeyChange={(newKeyCode) => handleHotkeyChange(label, newKeyCode)}
                onDeselect={() => onHotkeyDeselect?.()}
            />,
        );
    }

    return (
        <TechWindow icon={getAsset("assets/Settings.png")} id={id} visible={visible}>
            <scrollingframe
                key="InteractionOptions"
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                ScrollBarThickness={6}
                Selectable={false}
                Size={new UDim2(0.8, 0, 1, 0)}
            >
                <uilistlayout Padding={new UDim(0, 9)} SortOrder={Enum.SortOrder.LayoutOrder} />
                <uipadding PaddingRight={new UDim(0, 5)} />

                {/* General Section */}
                <SettingSection title="General" />

                <SettingToggle setting="Music" />

                <SettingToggle setting="SoundEffects" title="Sound Effects" />

                <SettingToggle setting="ScientificNotation" title="Scientific Notation" />

                <SettingToggle
                    setting="FormatCurrencies"
                    title="Format Currencies"
                    subtitle="This is forcefully disabled on smaller screens."
                />

                {/* Performance Section */}
                <SettingSection title="Performance" />

                <SettingToggle setting="ResetAnimation" title="Reset Layer Animations" />

                <SettingToggle setting="BuildAnimation" title="Build Animations" />

                <SettingToggle setting="CurrencyGainAnimation" title="Currency Gain Animations" />

                <SettingToggle
                    setting="Particles"
                    title="Item Particles"
                    subtitle="Items may need to be placed again to apply changes."
                />

                <SettingToggle
                    setting="ItemShadows"
                    title="Item Shadows"
                    subtitle="Items may need to be placed again to apply changes."
                />

                <SettingToggle setting="VisualRain" title="Visual Rain" subtitle="Toggle rain particle effects." />

                {/* Layout Section */}
                <SettingSection title="Layout" />

                <SettingToggle title="Hide Maxed Items" setting="HideMaxedItems" />

                <SettingToggle title="Focus Camera On Shops" setting="FocusShopCamera" />

                {/* Controls Section */}
                <SettingSection title="Controls" />

                {/* Hotkeys */}
                {hotkeyOptions}
            </scrollingframe>
        </TechWindow>
    );
}
