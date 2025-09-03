import React from "@rbxts/react";
import { RobotoSlab, RobotoSlabBold, RobotoSlabMedium } from "shared/ui/GameFonts";

interface CommandOptionProps {
    alias: string;
    description: string;
    permissionLevel: number;
    userPermissionLevel: number;
    layoutOrder?: number;
}

export default function CommandOption({
    alias,
    description,
    permissionLevel,
    userPermissionLevel,
    layoutOrder = 0,
}: CommandOptionProps) {
    const isDisabled = permissionLevel > userPermissionLevel;
    const backgroundTransparency = isDisabled ? 0.5 : 0.8;

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={backgroundTransparency}
            BorderSizePixel={0}
            ClipsDescendants={true}
            Size={new UDim2(1, 0, 0, 80)}
            LayoutOrder={layoutOrder}
        >
            <uicorner CornerRadius={new UDim(0.25, 0)} />

            {/* Command Alias Label */}
            <textlabel
                key="AliasLabel"
                Active={true}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0, 0, 0.1, 0)}
                Size={new UDim2(0.5, 0, 0.4, 0)}
                Text={alias}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Permission Level Label */}
            <textlabel
                key="PermLevelLabel"
                Active={true}
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0.5, 0, 0.15, 0)}
                Size={new UDim2(0.5, 0, 0.3, 0)}
                Text={`Permission Level ${permissionLevel}`}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Description Label */}
            <textlabel
                key="DescriptionLabel"
                Active={true}
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(1, 0, 0.5, 0)}
                Text={description}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={25}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uitextsizeconstraint MaxTextSize={25} />
                <uistroke Thickness={2} />
            </textlabel>
        </frame>
    );
}
