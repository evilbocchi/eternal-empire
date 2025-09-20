import React, { ReactNode, useEffect, useMemo, useState } from "@rbxts/react";
import ProgressBar from "client/ui/components/window/ProgressBar";
import { RobotoMonoBold, RobotoSlabHeavy } from "client/ui/GameFonts";
import { AREAS } from "shared/world/Area";
import { SingleWorldNode } from "shared/world/nodes/WorldNode";

export function AreaStatEntry({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0.075, 0)}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.4, 0, 0.8, 0)}
                Text={title}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={4} />
            </textlabel>
            {children}
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </frame>
    );
}

export default function AreaBoardGui({
    areaId,
    children,
    dropletCount,
    dropletLimit,
    placedItemsText = "0",
}: {
    areaId: AreaId;
    children?: ReactNode;
    dropletCount: number;
    dropletLimit: number;
    placedItemsText?: string;
}) {
    const area = AREAS[areaId];
    const boardWorldNode = area.boardWorldNode;
    if (boardWorldNode === undefined) throw `Area ${areaId} does not have a board world node.`;
    const gridWorldNode = area.gridWorldNode;
    if (gridWorldNode === undefined) throw `Area ${areaId} does not have a grid world node.`;

    const [gridSize, setGridSize] = useState<Vector3>(new Vector3(0, 0, 0));

    useEffect(() => {
        const gridPart = gridWorldNode.waitForInstance();
        const onSizeChanged = () => {
            setGridSize(gridPart.Size);
        };
        onSizeChanged();
        const connection = gridPart.GetPropertyChangedSignal("Size").Connect(onSizeChanged);
        return () => connection.Disconnect();
    }, [gridWorldNode]);

    const percentageDropletLimit = dropletLimit === 0 ? 0 : dropletCount / dropletLimit;
    let colorSequence: ColorSequence;
    if (percentageDropletLimit < 0.5) {
        colorSequence = new ColorSequence([
            new ColorSequenceKeypoint(0, Color3.fromRGB(0, 255, 0)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 0)),
        ]);
    } else if (percentageDropletLimit < 0.8) {
        colorSequence = new ColorSequence([
            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 0)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 165, 0)),
        ]);
    } else {
        colorSequence = new ColorSequence([
            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 0, 0)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(139, 0, 0)),
        ]);
    }
    return (
        <surfacegui
            Adornee={boardWorldNode.waitForInstance()}
            ClipsDescendants={true}
            LightInfluence={1}
            MaxDistance={300}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 15)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <uipadding PaddingLeft={new UDim(0, 25)} PaddingRight={new UDim(0, 25)} PaddingTop={new UDim(0, 25)} />

            {children}
            <AreaStatEntry title="Droplet Count:">
                <ProgressBar
                    current={dropletCount}
                    max={dropletLimit}
                    colorSequence={colorSequence}
                    frameProps={{ Size: new UDim2(0.5, 0, 0.5, 0) }}
                />
            </AreaStatEntry>
            <AreaStatEntry title="Grid Size:">
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.5, 0, 0.8, 0)}
                    Text={`${gridSize.X} x ${gridSize.Z}`}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Thickness={4} />
                </textlabel>
            </AreaStatEntry>
            <AreaStatEntry title="Placed Items:">
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.5, 0, 0.8, 0)}
                    Text={placedItemsText}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Thickness={4} />
                </textlabel>
            </AreaStatEntry>
        </surfacegui>
    );
}
