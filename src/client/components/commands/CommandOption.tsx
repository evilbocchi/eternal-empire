import React from "@rbxts/react";
import { RobotoSlab, RobotoSlabBold, RobotoSlabMedium } from "client/GameFonts";
import useHover from "client/hooks/useHover";

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
    const { hovering, events } = useHover({});
    const isDisabled = permissionLevel > userPermissionLevel;

    // Color coding based on permission level
    const getPermissionColor = (level: number): Color3 => {
        switch (level) {
            case 0:
                return Color3.fromRGB(102, 204, 102); // Green - Everyone
            case 1:
                return Color3.fromRGB(102, 178, 255); // Light Blue - Basic Staff
            case 2:
                return Color3.fromRGB(255, 204, 102); // Orange - Moderator
            case 3:
                return Color3.fromRGB(255, 102, 102); // Red - Admin
            default:
                return Color3.fromRGB(204, 102, 255); // Purple - Owner+
        }
    };

    const permissionColor = getPermissionColor(permissionLevel);

    return (
        <frame
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 0, 100)}
            LayoutOrder={layoutOrder}
            Event={{
                ...events,
            }}
        >
            <canvasgroup
                BackgroundColor3={Color3.fromRGB(30, 30, 30)}
                BackgroundTransparency={isDisabled ? 0.7 : hovering ? 0.6 : 0.8}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-1}
            >
                {/* Permission Level Indicator */}
                <frame
                    key="PermissionIndicator"
                    BackgroundColor3={permissionColor}
                    BackgroundTransparency={isDisabled ? 0.5 : 0}
                    BorderSizePixel={0}
                    Position={new UDim2(0, 0, 0, 0)}
                    Size={new UDim2(0, 4, 1, 0)}
                />
                <uistroke Color={permissionColor} Thickness={hovering && !isDisabled ? 2 : 1} />
                <uicorner CornerRadius={new UDim(0, 8)} />
            </canvasgroup>

            {/* Command Header */}
            <frame
                key="CommandHeader"
                BackgroundTransparency={1}
                Position={new UDim2(0, 15, 0, 10)}
                Size={new UDim2(1, -15, 0, 30)}
            >
                {/* Command Alias */}
                <textlabel
                    key="AliasLabel"
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0, 0, 0, 0)}
                    Size={new UDim2(0.6, 0, 1, 0)}
                    Text={`/${alias}`}
                    TextColor3={isDisabled ? Color3.fromRGB(150, 150, 150) : Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={1} Color={Color3.fromRGB(0, 0, 0)} />
                </textlabel>

                {/* Permission Level Badge */}
                <frame
                    key="PermissionBadge"
                    AnchorPoint={new Vector2(1, 0)}
                    BackgroundColor3={permissionColor}
                    BackgroundTransparency={isDisabled ? 0.5 : 0}
                    BorderSizePixel={0}
                    Position={new UDim2(1, -7, 0, 0)}
                    Size={new UDim2(0, 100, 1, -14)}
                >
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabMedium}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text={`Level ${permissionLevel}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                    >
                        <uistroke Thickness={1} Color={Color3.fromRGB(0, 0, 0)} />
                    </textlabel>
                </frame>
            </frame>

            {/* Description */}
            <textlabel
                key="DescriptionLabel"
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0, 15, 0, 45)}
                Size={new UDim2(1, -30, 0, 45)}
                Text={description}
                TextColor3={isDisabled ? Color3.fromRGB(180, 180, 180) : Color3.fromRGB(220, 220, 220)}
                TextScaled={true}
                TextSize={16}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uitextsizeconstraint MaxTextSize={16} />
                <uistroke Thickness={1} Color={Color3.fromRGB(0, 0, 0)} />
            </textlabel>

            {/* Disabled Overlay */}
            {isDisabled && (
                <frame
                    key="DisabledOverlay"
                    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                    BackgroundTransparency={0.3}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 1, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        Size={new UDim2(0, 120, 0, 25)}
                        Text="INSUFFICIENT PERMS"
                        TextColor3={Color3.fromRGB(255, 100, 100)}
                        TextScaled={true}
                        TextSize={12}
                        Rotation={-15}
                    >
                        <uitextsizeconstraint MaxTextSize={12} />
                        <uistroke Thickness={2} Color={Color3.fromRGB(0, 0, 0)} />
                    </textlabel>
                </frame>
            )}
        </frame>
    );
}
