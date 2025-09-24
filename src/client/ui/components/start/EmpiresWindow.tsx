import ComputeNameColor from "@antivivi/rbxnamecolor";
import { convertToHHMMSS } from "@antivivi/vrldk";
import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { Players } from "@rbxts/services";
import { RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";
import useProperty from "client/ui/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { getNameFromUserId } from "shared/constants";
import Packets from "shared/Packets";

/**
 * Individual empire option component
 */
function EmpireOption({ empireId, empireInfo }: { empireId: string; empireInfo: EmpireInfo }) {
    const [avatarImage, setAvatarImage] = useState("");

    const handleClick = useCallback(() => {
        playSound("MenuClick.mp3");
        Packets.teleportToEmpire.toServer(empireId);
    }, [empireId]);

    const color = empireInfo.name
        ? (ComputeNameColor(empireInfo.name) ?? Color3.fromRGB(0, 170, 0))
        : Color3.fromRGB(0, 170, 0);

    // Load avatar asynchronously
    useEffect(() => {
        if (empireInfo.owner) {
            task.spawn(() => {
                try {
                    const [thumbnail] = Players.GetUserThumbnailAsync(
                        empireInfo.owner,
                        Enum.ThumbnailType.HeadShot,
                        Enum.ThumbnailSize.Size150x150,
                    );
                    setAvatarImage(thumbnail);
                } catch (error) {
                    warn("Failed to load avatar:", error);
                }
            });
        }
    }, [empireInfo.owner]);

    return (
        <textbutton
            BackgroundColor3={Color3.fromRGB(0, 170, 0)}
            BackgroundTransparency={0.5}
            BorderSizePixel={0}
            Selectable={false}
            Size={new UDim2(1, 0, 0, 85)}
            Text={""}
        >
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156)),
                    ])
                }
                Rotation={90}
            />
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(0, 170, 0)} />
            <uicorner CornerRadius={new UDim(0, 4)} />
            <uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
            <frame BackgroundTransparency={1} Size={new UDim2(0.65, 0, 1, 0)}>
                <frame BackgroundTransparency={1} Size={new UDim2(0.65, 0, 1, -10)}>
                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={1}
                        Position={new UDim2(0.5, 0, 0, 0)}
                        Size={new UDim2(1, 0, 0.3, 0)}
                        Text={
                            empireInfo.owner ? "Owned by " + getNameFromUserId(empireInfo.owner) : "could not load info"
                        }
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                                    ])
                                }
                                Rotation={90}
                            />
                        </uistroke>
                    </textlabel>
                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.25, 0)}
                        Size={new UDim2(1, 0, 0.4, 0)}
                        Text={empireInfo.name}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                                    ])
                                }
                                Rotation={90}
                            />
                        </uistroke>
                    </textlabel>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                </frame>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    Padding={new UDim(0.05, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <imagelabel
                    BackgroundTransparency={1}
                    Image={avatarImage}
                    LayoutOrder={-1}
                    Size={new UDim2(1, -10, 1, -10)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            </frame>
            <frame
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundTransparency={1}
                LayoutOrder={1}
                Position={new UDim2(1, 0, 0.5, 0)}
                Size={new UDim2(0.25, 0, 1, -10)}
            >
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0.05, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <textlabel
                    Active={true}
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Position={new UDim2(0.5, 0, 0.25, 0)}
                    Size={new UDim2(1, 0, 0.25, 0)}
                    Text={`Items: ${empireInfo.items}`}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>
                <textlabel
                    Active={true}
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    LayoutOrder={1}
                    Position={new UDim2(0.5, 0, 0.25, 0)}
                    Size={new UDim2(1, 0, 0.25, 0)}
                    Text={`Playtime: ${convertToHHMMSS(empireInfo.playtime)}`}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>
                <textlabel
                    Active={true}
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    LayoutOrder={2}
                    Position={new UDim2(0.5, 0, 0.25, 0)}
                    Size={new UDim2(1, 0, 0.25, 0)}
                    Text={`Created: ${os.date("%x", empireInfo.created)}`}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Color={Color3.fromRGB(0, 170, 0)} Thickness={2}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>
            </frame>
            <textlabel
                Active={true}
                AnchorPoint={new Vector2(0.5, 1)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0.95, 0)}
                Size={new UDim2(1, 0, 0.01, 15)}
                Text={empireId}
                TextColor3={Color3.fromRGB(156, 156, 156)}
                TextScaled={true}
                TextSize={14}
                TextTransparency={0.9}
                TextWrapped={true}
            />
        </textbutton>
    );
}

/**
 * Empires window component for empire selection and creation
 */
export default function EmpiresWindow({
    onClose,
}: {
    /** Close callback */
    onClose: () => void;
}) {
    const availableEmpires = useProperty(Packets.availableEmpires);
    const [isCreatingEmpire, setIsCreatingEmpire] = useState(false);

    const handleClose = useCallback(() => {
        playSound("MenuClick.mp3");
        onClose();
    }, [onClose]);

    const handleCreateEmpire = useCallback(() => {
        if (isCreatingEmpire) return;

        setIsCreatingEmpire(true);
        const success = Packets.createNewEmpire.toServer();
        if (success) {
            playSound("MenuClick.mp3");
        } else {
            playSound("Error.mp3");
        }

        // Reset state after delay
        task.delay(3, () => setIsCreatingEmpire(false));
    }, [isCreatingEmpire]);

    const handleJoinPublic = useCallback(() => {
        playSound("MenuClick.mp3");
        // TODO: Implement joining a public empire
    }, []);

    return (
        <imagelabel
            Active={true}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(25, 25, 35)}
            BorderSizePixel={0}
            Image={getAsset("assets/GridHighContrast.png")}
            ImageTransparency={0.95}
            Position={new UDim2(0.5, 0, 0.65, 0)}
            Size={new UDim2(0.425, 200, 0.6, 0)}
            ZIndex={2}
        >
            <uicorner CornerRadius={new UDim(0, 12)} />
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 45)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                    ])
                }
                Rotation={270}
            />
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={Color3.fromRGB(85, 170, 255)}
                Thickness={3}
            />

            {/* Title */}
            <textlabel
                Active={true}
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0, 30, 0, 0)}
                Rotation={2}
                Size={new UDim2(0, 0, 0.04, 30)}
                Text="Join an Empire"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Empire Options Scrolling Frame */}
            <scrollingframe
                Active={true}
                BackgroundColor3={Color3.fromRGB(15, 15, 25)}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Position={new UDim2(0, 10, 0.1, 0)}
                Size={new UDim2(1, -20, 0.65, 0)}
                ScrollBarThickness={6}
                ScrollBarImageColor3={Color3.fromRGB(85, 170, 255)}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
                <uistroke Color={Color3.fromRGB(75, 75, 85)} Thickness={2} />

                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.Name}
                />
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />

                {/* Create New Empire Option */}
                <textbutton
                    BackgroundColor3={Color3.fromRGB(85, 170, 255)}
                    BorderSizePixel={0}
                    Size={new UDim2(1, -20, 0, 60)}
                    Text=""
                    Event={{ Activated: handleCreateEmpire }}
                >
                    <uicorner CornerRadius={new UDim(0, 8)} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(85, 170, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(65, 140, 215)),
                            ])
                        }
                        Rotation={90}
                    />
                    <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={2} />

                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text={isCreatingEmpire ? "Creating empire..." : "Create New Empire"}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                </textbutton>

                {/* Empire Options */}
                {(() => {
                    const empireElements: React.Element[] = [];
                    for (const [empireId, empireInfo] of availableEmpires) {
                        empireElements.push(
                            <EmpireOption key={empireId} empireId={empireId} empireInfo={empireInfo} />,
                        );
                    }
                    return empireElements;
                })()}
            </scrollingframe>

            {/* Public Empire Window */}
            <frame
                Active={true}
                BackgroundTransparency={1}
                Position={new UDim2(0, 10, 0.8, 0)}
                Size={new UDim2(1, -20, 0.2, -10)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Join Public Empire Button */}
                <textbutton
                    BackgroundColor3={Color3.fromRGB(0, 170, 0)}
                    BackgroundTransparency={0.5}
                    BorderSizePixel={0}
                    LayoutOrder={1}
                    Size={new UDim2(0.4, 0, 0.6, 0)}
                    Text=""
                    Event={{ Activated: handleJoinPublic }}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156)),
                            ])
                        }
                        Rotation={90}
                    />
                    <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(0, 170, 0)} />
                    <uicorner CornerRadius={new UDim(0, 4)} />

                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.8, 0, 0.8, 0)}
                        Text="Join Public Empire"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke />
                    </textlabel>
                </textbutton>

                {/* Info Label */}
                <frame BackgroundTransparency={1} Size={new UDim2(0.4, 0, 0.9, 0)}>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />

                    <textlabel
                        Active={true}
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Size={new UDim2(0, 0, 0.5, 0)}
                        Text="Join this server's empire!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    <textlabel
                        Active={true}
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={1}
                        Size={new UDim2(0, 0, 0.5, 0)}
                        Text="(Your data does not save upon leaving with this option)"
                        TextColor3={Color3.fromRGB(198, 198, 198)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                </frame>
            </frame>

            {/* Background Pattern */}
            <imagelabel
                BackgroundTransparency={1}
                Image="rbxassetid://6372755229"
                ImageColor3={Color3.fromRGB(0, 0, 0)}
                ImageTransparency={0.8}
                Rotation={180}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(1, 2, 1, 2)}
                TileSize={new UDim2(0, 200, 0, 200)}
                ZIndex={-5}
            />

            {/* Close Button */}
            <textbutton
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(255, 76, 76)}
                BorderSizePixel={0}
                FontFace={RobotoSlabBold}
                Position={new UDim2(1, -5, 0, 5)}
                Rotation={45}
                Size={new UDim2(0, 30, 0.075, 25)}
                Text=""
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextStrokeTransparency={0}
                TextWrapped={true}
                ZIndex={104}
                Event={{ Activated: handleClose }}
            >
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Rotation={-45}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text="×"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextStrokeColor3={Color3.fromRGB(118, 118, 118)}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    ZIndex={70}
                />
                <uiaspectratioconstraint />
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(255, 76, 76)}
                    Thickness={2}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 170)),
                                new ColorSequenceKeypoint(0.5, Color3.fromRGB(171, 171, 171)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(68, 68, 68)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.669, Color3.fromRGB(206, 206, 206)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(173, 0, 0)),
                        ])
                    }
                    Rotation={45}
                />
                <uicorner CornerRadius={new UDim(0.3, 0)} />
            </textbutton>
        </imagelabel>
    );
}
