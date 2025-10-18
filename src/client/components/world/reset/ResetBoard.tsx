import Difficulty from "@rbxts/ejt";
import React, { ReactNode } from "@rbxts/react";
import { RobotoMonoBold, RobotoSlabHeavy } from "shared/asset/GameFonts";

export default function BasicResetBoardFrontGui({
    adornee,
    difficulty,
    children,
}: {
    adornee: BasePart;
    difficulty: Difficulty;
    children: ReactNode;
}) {
    return (
        <surfacegui
            Adornee={adornee}
            ClipsDescendants={true}
            Face={Enum.NormalId.Front}
            MaxDistance={200}
            ResetOnSpawn={false}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <imagelabel
                BackgroundTransparency={1}
                Image={difficulty.image}
                ImageTransparency={0.9}
                ScaleType={Enum.ScaleType.Crop}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uipadding
                    PaddingBottom={new UDim(0, 5)}
                    PaddingLeft={new UDim(0, 5)}
                    PaddingRight={new UDim(0, 5)}
                    PaddingTop={new UDim(0, 5)}
                >
                    <uipadding
                        PaddingBottom={new UDim(0, 5)}
                        PaddingLeft={new UDim(0, 5)}
                        PaddingRight={new UDim(0, 5)}
                        PaddingTop={new UDim(0, 5)}
                    />
                </uipadding>
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} />
                    {children}
                </frame>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
            </imagelabel>
        </surfacegui>
    );
}

export function BasicResetBoardBackGui({
    adornee,
    resetLayer,
    nameOfX,
}: {
    adornee: BasePart;
    resetLayer: ResetLayer;
    nameOfX: string;
}) {
    return (
        <surfacegui
            Adornee={adornee}
            ClipsDescendants={true}
            Face={Enum.NormalId.Back}
            MaxDistance={200}
            ResetOnSpawn={false}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                LayoutOrder={4}
                RichText={true}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.6, 0, 0.1, 0)}
                Text={resetLayer.formula.tostring(nameOfX, 50)}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={60}
                TextStrokeTransparency={0}
                TextWrapped={true}
            >
                <uistroke Thickness={3} />
            </textlabel>
        </surfacegui>
    );
}

export function BasicZoneGui({
    adornee,
    text,
    size = new UDim2(16, 0, 2, 0),
    colorSequence,
}: {
    adornee: BasePart;
    text?: string;
    size?: UDim2;
    colorSequence: ColorSequence;
}) {
    return (
        <billboardgui
            Adornee={adornee}
            Active={true}
            ClipsDescendants={true}
            MaxDistance={500}
            Size={size}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 1, 0)}
                Text={text}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient Color={colorSequence} Rotation={90} />
            </textlabel>
        </billboardgui>
    );
}

export function BasicResetBoardTitle({ text, colorSequence }: { text: string; colorSequence: ColorSequence }) {
    return (
        <textlabel
            BackgroundTransparency={1}
            FontFace={RobotoSlabHeavy}
            Size={new UDim2(0.5, 0, 0.125, 0)}
            Text={text}
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextSize={100}
            TextWrapped={true}
        >
            <uiscale Scale={2} />
            <uistroke Thickness={2} />
            <uigradient Color={colorSequence} Rotation={90} />
        </textlabel>
    );
}
