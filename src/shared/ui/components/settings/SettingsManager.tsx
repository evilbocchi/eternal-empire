import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import IconButton from "shared/ui/components/IconButton";
import SettingsWindow, { SettingsWindowProps } from "shared/ui/components/settings/SettingsWindow";

interface SettingsManagerProps extends SettingsWindowProps {

}

export function SettingsButton({ onClick }: { onClick: () => void; }) {
    return (
        <IconButton image={getAsset("assets/Settings.png")}
            onClick={onClick}
            buttonProps={{
                AnchorPoint: new Vector2(0, 1),
                Size: new UDim2(0, 35, 0.5, 0),
                Position: new UDim2(0, 4, 1, -4)
            }}
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