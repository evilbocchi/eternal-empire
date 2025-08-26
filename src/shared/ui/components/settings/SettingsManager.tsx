import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import SettingsWindow, { SettingsWindowProps } from "shared/ui/components/settings/SettingsWindow";

interface SettingsManagerProps extends SettingsWindowProps {

}

export function SettingsButton({ onClick }: { onClick: () => void; }) {
    return (
        <imagebutton
            key='SettingsButton'
            AnchorPoint={new Vector2(0, 1)}
            Image={getAsset("assets/Settings.png")}
            BackgroundTransparency={1}
            Event={{
                Activated: onClick
            }}
            Size={new UDim2(0.025, 40, 0.5, 0)}
            Position={new UDim2(0, 0, 1, 0)}
        >
            
            <uiaspectratioconstraint />
        </imagebutton>
    );
}

export default function SettingsManager(props: SettingsManagerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (<frame
        key='SettingsManager'
        BackgroundTransparency={1}
        Size={new UDim2(1, 0, 1, 0)}
    >
        <SettingsWindow onClose={() => setIsOpen(false)} visible={isOpen} {...props} />
        <SettingsButton onClick={() => setIsOpen(!isOpen)} />
    </frame>);
}