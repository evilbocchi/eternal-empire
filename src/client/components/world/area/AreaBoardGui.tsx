import React, { ReactNode, useEffect, useState } from "@rbxts/react";
import ProgressBar from "client/components/window/ProgressBar";
import { RobotoMono, RobotoMonoBold, RobotoSlabHeavy } from "client/GameFonts";
import Area from "shared/world/Area";

declare global {
    interface AreaBoardGuiProps {
        area: Area;
        colorSequence?: ColorSequence;
        children?: ReactNode;
        dropletCount?: number;
        dropletLimit?: number;
        placedItemsText?: string;
    }
}

export function AreaStatEntry({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0.075, 0)}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.35, 0, 0.8, 0)}
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
    area,
    children,
    dropletCount = 0,
    dropletLimit = 100,
    placedItemsText = "0",
}: AreaBoardGuiProps) {
    const boardWorldNode = area.boardWorldNode;
    if (boardWorldNode === undefined) throw `Area ${area.id} does not have a board world node.`;
    const gridWorldNode = area.gridWorldNode;
    if (gridWorldNode === undefined) throw `Area ${area.id} does not have a grid world node.`;

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
                    fontFace={RobotoMonoBold}
                    frameProps={{ Size: new UDim2(0.35, 0, 0.8, 0) }}
                />
            </AreaStatEntry>
            <AreaStatEntry title="Grid Size:">
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.35, 0, 0.8, 0)}
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
                    Size={new UDim2(0.35, 0, 0.8, 0)}
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

export function SimpleAreaBoardDescription(props: AreaBoardGuiProps) {
    const dampenedKeypoints = props.colorSequence?.Keypoints.map((keypoint) => {
        return new ColorSequenceKeypoint(keypoint.Time, keypoint.Value.Lerp(Color3.fromRGB(255, 255, 255), 0.8));
    });
    const dampenedColorSequence = new ColorSequence(
        dampenedKeypoints ?? [
            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
        ],
    );
    return (
        <textlabel
            BackgroundTransparency={1}
            FontFace={RobotoMono}
            Size={new UDim2(0.8, 0, 0.3, 0)}
            Text={props.area.description}
            TextColor3={Color3.fromRGB(237, 237, 237)}
            TextScaled={true}
            TextWrapped={true}
            TextYAlignment={Enum.TextYAlignment.Top}
        >
            <uigradient Color={dampenedColorSequence} Rotation={90} />
            <uistroke Thickness={2} />
            <uitextsizeconstraint MaxTextSize={60} />
            <uipadding PaddingBottom={new UDim(0, 50)} />
        </textlabel>
    );
}

export function SimpleAreaBoardGui(props: AreaBoardGuiProps) {
    return (
        <AreaBoardGui {...props}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.15, 0)}
                Text={props.area.name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
            >
                <uigradient Color={props.colorSequence} Rotation={90} />
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={3} />
            </textlabel>
            <SimpleAreaBoardDescription {...props} />
        </AreaBoardGui>
    );
}

export function EmphasizedHeaderAreaBoardGui(props: AreaBoardGuiProps) {
    return (
        <AreaBoardGui {...props}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.1, 0)}
                Text={props.area.name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={100}
                TextWrapped={true}
            >
                <uiscale Scale={1.5} />
                <uigradient Color={props.colorSequence} Rotation={90} />
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={3} />
            </textlabel>
            <SimpleAreaBoardDescription {...props} />
        </AreaBoardGui>
    );
}

export function OminousAreaBoardGui(props: AreaBoardGuiProps) {
    return (
        <AreaBoardGui {...props}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.1, 0)}
                Text={props.area.name}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={100}
                TextWrapped={true}
            >
                <uiscale Scale={2} />
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(92, 0, 0)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(43, 0, 0)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.8, 0, 0.3, 0)}
                Text={props.area.description}
                TextColor3={Color3.fromRGB(255, 0, 0)}
                TextScaled={true}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2} />
            </textlabel>
        </AreaBoardGui>
    );
}

export function SereneAreaBoardGui(props: AreaBoardGuiProps) {
    return (
        <AreaBoardGui {...props}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.125, 0)}
                Text={props.area.name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={100}
                TextWrapped={true}
            >
                <uiscale Scale={1.75} />
                <uigradient Color={props.colorSequence} Rotation={90} />
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={3} />
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(0.8, 0, 0.3, 0)}
                Text={props.area.description}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={4} />
                <uitextsizeconstraint MaxTextSize={100} />
            </textlabel>
        </AreaBoardGui>
    );
}
