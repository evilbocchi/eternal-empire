import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import useHotkeyWithTooltip from "shared/ui/components/hotkeys/useHotkeyWithTooltip";
import IconButton from "shared/ui/components/IconButton";
import SettingsWindow, { SettingsWindowProps } from "shared/ui/components/settings/SettingsWindow";

interface SettingsManagerProps extends SettingsWindowProps {
    defaultVisible?: boolean;
}

export function SettingsButton({ tooltipProps }: { tooltipProps: TooltipProps; }) {

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
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = useCallback(() => {
        if (isOpen) {
            playSound("MenuClose.mp3");
            setIsOpen(false);
        } else {
            playSound("MenuOpen.mp3");
            setIsOpen(true);
        }
    }, []);

    // Bind the P key to toggle settings
    const tooltipProps = useHotkeyWithTooltip({
        keyCode: Enum.KeyCode.P,
        action: () => {
            handleToggle();
            return true;
        },
        label: "Settings"
    });

    useEffect(() => {
        if (props.defaultVisible) {
            setIsOpen(props.defaultVisible);
        }
    }, [props.defaultVisible]);

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