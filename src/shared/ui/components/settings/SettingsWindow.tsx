import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import Packets from "shared/Packets";
import { useHotkeys } from "shared/ui/components/hotkeys/HotkeyProvider";
import WindowCloseButton from "shared/ui/components/window/WindowCloseButton";
import WindowTitle from "shared/ui/components/window/WindowTitle";
import { useWindow } from "shared/ui/components/window/WindowManager";
import { RobotoMonoBold } from "shared/ui/GameFonts";
import useProperty from "shared/ui/hooks/useProperty";
import HotkeyOption from "./HotkeyOption";
import SettingSection from "./SettingSection";
import SettingToggle from "./SettingToggle";

export interface SettingsWindowProps {
    visible?: boolean;
    onClose?: () => void;
}

export default function SettingsWindow({
    visible = false,
    onClose,
}: SettingsWindowProps) {
    const frameContentRef = useRef<Frame>();
    const [previousVisible, setPreviousVisible] = useState(visible);
    const [selectedHotkey, setSelectedHotkey] = useState<string | undefined>();
    const settings = useProperty(Packets.settings);
    const { bindingsRef, setIsSettingHotkey } = useHotkeys();

    // Register with window manager with higher priority than normal windows
    useWindow("settings", visible, onClose || (() => { }), 10);

    const initialPosition = new UDim2(0.5, 0, 0.5, 0);

    // Cleanup hotkey setting state when component unmounts or window closes
    useEffect(() => {
        if (!visible && selectedHotkey !== undefined) {
            setSelectedHotkey(undefined);
            setIsSettingHotkey(false);
        }
    }, [visible]);

    const handleClose = useCallback(() => {
        if (selectedHotkey !== undefined) {
            setSelectedHotkey(undefined);
            setIsSettingHotkey(false);
        }
        onClose?.();
    }, [selectedHotkey, setIsSettingHotkey, onClose]);

    const onHotkeySelect = useCallback((hotkeyName: string) => {
        const newSelected = selectedHotkey === hotkeyName ? undefined : hotkeyName;
        setSelectedHotkey(newSelected);
        setIsSettingHotkey(newSelected !== undefined);
    }, [selectedHotkey, setIsSettingHotkey]);

    const onHotkeyDeselect = useCallback(() => {
        setSelectedHotkey(undefined);
        setIsSettingHotkey(false);
    }, [setIsSettingHotkey]);

    const handleHotkeyChange = useCallback((label: string, keyCode: Enum.KeyCode) => {
        Packets.setHotkey.toServer(label, keyCode.Value);
        setSelectedHotkey(undefined);
        setIsSettingHotkey(false);
    }, [setSelectedHotkey, setIsSettingHotkey]);

    useEffect(() => {
        const action = (visible && !previousVisible) ? "open" : (!visible && previousVisible) ? "close" : undefined;
        // Handle animation
        if (action) {
            const frameContent = frameContentRef.current!;

            if (action === "open")
                frameContent.Visible = true;

            const middle = initialPosition;
            const below = middle.sub(new UDim2(0, 0, 0, 30));
            frameContent.Position = action === "open" ? below : middle;

            const tweenInfo = action === "open" ? new TweenInfo(0.2) : new TweenInfo(0.1, Enum.EasingStyle.Linear);
            const tween = TweenService.Create(frameContent, tweenInfo, {
                Position: action === "open" ? middle : below
            });

            tween.Play();
            tween.Completed.Connect(() => {
                frameContent.Visible = visible;
            });
        }
        setPreviousVisible(visible);
    }, [visible]);

    const hotkeyOptions = new Array<JSX.Element>();
    for (const [index, binding] of bindingsRef.current) {
        const label = tostring(index);
        const value = settings.hotkeys[label];
        const keyText = value !== undefined ? Enum.KeyCode.FromValue(value)?.Name : binding.keyCode.Name;
        hotkeyOptions.push(<HotkeyOption
            key={label}
            title={label}
            keyText={keyText ?? "?"}
            isSelected={selectedHotkey === label}
            onSelect={() => onHotkeySelect?.(label)}
            onHotkeyChange={(newKeyCode) => handleHotkeyChange(label, newKeyCode)}
            onDeselect={() => onHotkeyDeselect?.()}
        />);
    }

    return (
        <frame
            key="Settings"
            ref={frameContentRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(13, 13, 13)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            Selectable={true}
            Size={new UDim2(0.9, 0, 0.9, -50)}
            Position={initialPosition}
            Visible={false}
        >
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} />
            <uisizeconstraint
                MaxSize={new Vector2(800, 600)}
            />
            <WindowTitle icon={getAsset("assets/Settings.png")} title="Settings" font={RobotoMonoBold} />
            <WindowCloseButton onClick={handleClose} />
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
                <SettingSection title="General" />

                <SettingToggle setting="Music" />

                <SettingToggle
                    setting="SoundEffects"
                    title="Sound Effects"
                />

                <SettingToggle
                    setting="ScientificNotation"
                    title="Scientific Notation"
                />

                <SettingToggle
                    setting="FormatCurrencies"
                    title="Format Currencies"
                    subtitle="This is forcefully disabled on smaller screens."
                />

                {/* Performance Section */}
                <SettingSection title="Performance" />

                <SettingToggle
                    setting="ResetAnimation"
                    title="Reset Layer Animations"
                />

                <SettingToggle
                    setting="BuildAnimation"
                    title="Build Animations"
                />

                <SettingToggle
                    setting="CurrencyGainAnimation"
                    title="Currency Gain Animations"
                />

                <SettingToggle
                    title="Item Shadows"
                    subtitle="Items may need to be placed again to apply changes."
                    setting="ItemShadows"
                />

                {/* Layout Section */}
                <SettingSection title="Layout" />

                <SettingToggle
                    title="Hide Maxed Items"
                    setting="HideMaxedItems"
                />

                {/* Controls Section */}
                <SettingSection title="Controls" />

                {/* Hotkeys */}
                {hotkeyOptions}
            </scrollingframe>
        </frame>
    );
}
