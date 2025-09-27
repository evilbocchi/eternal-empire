import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/components/window/TechWindow";
import { COLOR_SEQUENCE_PER_AREA } from "client/components/world/area/AreaBoardRenderer";
import { observeCharacter } from "client/constants";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import { showErrorToast } from "client/components/toast/ToastService";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import PortableBeacon from "shared/items/tools/PortableBeacon";
import Packets from "shared/Packets";

interface AreaInfo {
    name: string;
    description: string;
    image: AssetPath;
    layoutOrder: number;
}

// Define the main areas that should appear in the teleportation window
const TELEPORTABLE_AREAS: {
    [key in AreaId]?: AreaInfo;
} = {
    BarrenIslands: {
        name: "Barren Islands",
        description: "An abandoned region where your empire begins",
        image: "assets/area/BarrenIslandsLandscape.png",
        layoutOrder: 1,
    },
    SlamoVillage: {
        name: "Slamo Village",
        description: "A humble settlement where time seems to slow",
        image: "assets/area/SlamoVillageLandscape.png",
        layoutOrder: 2,
    },
    SkyPavilion: {
        name: "Sky Pavilion",
        description: "A floating sanctuary of modern architecture",
        image: "assets/area/SkyPavilionLandscape.png",
        layoutOrder: 3,
    },
};

export default function PortableBeaconWindow() {
    const { id, visible, openDocument, closeDocument } = useSingleDocument({ id: "PortableBeacon" });
    const [unlockedAreas, setUnlockedAreas] = useState<Set<AreaId>>(new Set(["BarrenIslands"]));

    useEffect(() => {
        const unlockedAreasConnection = Packets.unlockedAreas.observe((areas) => {
            const newAreas = new Set<AreaId>(["BarrenIslands"]);
            for (const areaId of areas) {
                newAreas.add(areaId);
            }
            setUnlockedAreas(newAreas);
        });

        let childAddedConnection: RBXScriptConnection | undefined;
        let childRemovedConnection: RBXScriptConnection | undefined;
        const onCharacterAdded = (character: Model) => {
            childAddedConnection?.Disconnect();
            childRemovedConnection?.Disconnect();
            childAddedConnection = character.ChildAdded.Connect((child) => {
                if (child.Name === PortableBeacon.id) {
                    openDocument();
                }
            });
            childRemovedConnection = character.ChildRemoved.Connect((child) => {
                if (child.Name === PortableBeacon.id) {
                    closeDocument();
                }
            });
        };
        const cleanup = observeCharacter(onCharacterAdded);

        return () => {
            unlockedAreasConnection.Disconnect();
            childAddedConnection?.Disconnect();
            childRemovedConnection?.Disconnect();
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (!visible) {
            getPlayerCharacter()?.FindFirstChildOfClass("Humanoid")?.UnequipTools();
        }
    }, [visible]);

    const areaElements = new Array<JSX.Element>();

    for (const [areaId, areaInfo] of pairs(TELEPORTABLE_AREAS)) {
        const isUnlocked = unlockedAreas.has(areaId);

        areaElements.push(<PortableBeaconOption areaId={areaId} areaInfo={areaInfo} isUnlocked={isUnlocked} />);
    }

    return (
        <TechWindow icon={getAsset("assets/PortableBeacon.png")} id={id} title="Portable Beacon" visible={visible}>
            <scrollingframe
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(1, 0, 0, 0)}
                Size={new UDim2(1, 0, 1, 0)}
                ScrollBarThickness={6}
                ScrollingDirection={Enum.ScrollingDirection.Y}
            >
                <uilistlayout
                    Padding={new UDim(0, 10)}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <uipadding
                    PaddingTop={new UDim(0, 10)}
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                />
                {areaElements}
            </scrollingframe>
        </TechWindow>
    );
}
function PortableBeaconOption({
    areaId,
    areaInfo,
    isUnlocked,
}: {
    areaId: AreaId;
    areaInfo: AreaInfo;
    isUnlocked: boolean;
}) {
    const ref = useRef<ImageButton>();
    const [isHovered, setHovered] = useState<boolean>(false);

    useEffect(() => {
        const button = ref.current;
        if (!button) return;
        if (isHovered) {
            TweenService.Create(button, new TweenInfo(0.2), {
                ImageTransparency: isUnlocked ? 0 : 0.75,
            }).Play();
        } else {
            TweenService.Create(button, new TweenInfo(0.2), {
                ImageTransparency: isUnlocked ? 0.2 : 0.8,
            }).Play();
        }
    }, [isHovered]);

    return (
        <imagebutton
            ref={ref}
            AutoButtonColor={false}
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BorderColor3={isHovered ? Color3.fromRGB(255, 237, 138) : Color3.fromRGB(61, 61, 61)}
            BorderSizePixel={3}
            Image={getAsset(areaInfo.image)}
            ImageTransparency={isUnlocked ? 0.2 : 0.8}
            Position={new UDim2(0, 10, 0, 10)}
            Size={new UDim2(1, -20, 0, 120)}
            ScaleType={Enum.ScaleType.Crop}
            LayoutOrder={areaInfo.layoutOrder}
            Active={isUnlocked}
            Event={{
                Activated: () => {
                    const success = Packets.tpToArea.toServer(areaId);
                    if (success) {
                        playSound("Teleport.mp3");
                        getPlayerCharacter()?.FindFirstChildOfClass("Humanoid")?.UnequipTools();
                    } else {
                        playSound("Error.mp3");
                        showErrorToast("Teleport failed. Try again in a moment.");
                    }
                },
                MouseEnter: () => setHovered(true),
                MouseLeave: () => setHovered(false),
            }}
        >
            <uipadding
                PaddingTop={new UDim(0, 10)}
                PaddingBottom={new UDim(0, 10)}
                PaddingLeft={new UDim(0, 20)}
                PaddingRight={new UDim(0, 20)}
            />
            <uistroke
                Color={new Color3(255, 255, 255)}
                Thickness={isHovered ? 2 : 1}
                Transparency={isUnlocked ? 0 : 0.7}
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
            </uistroke>
            {!isUnlocked && (
                <imagelabel
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Lock.png")}
                    Position={new UDim2(0.5, -12, 0.5, -12)}
                    Size={new UDim2(0, 24, 0, 24)}
                />
            )}

            {/* Area Info */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 0.3, 0)}
                Text={areaInfo.name}
                TextColor3={new Color3(255, 255, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Color={new Color3(0, 0, 0)} Thickness={2} />
                <uigradient Color={COLOR_SEQUENCE_PER_AREA[areaId]} Rotation={90} />
            </textlabel>

            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Position={new UDim2(0, 0, 0, 28)}
                Size={new UDim2(1, 0, 0.7, 0)}
                Text={isUnlocked ? areaInfo.description : "Area locked"}
                TextColor3={isUnlocked ? new Color3(255, 255, 255) : new Color3(140, 140, 140)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
                TextWrapped={true}
            >
                <uitextsizeconstraint MaxTextSize={24} />
                <uistroke Color={new Color3(0, 0, 0)} Thickness={2} />
            </textlabel>
        </imagebutton>
    );
}
