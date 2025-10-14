import { getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { packet, property } from "@rbxts/fletchette";
import React, { Fragment, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { BaseOnoeNum, OnoeNum } from "@rbxts/serikanum";
import { StarterGui, TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import { IS_EDIT } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import DifficultyResearch from "shared/difficulty/DifficultyResearch";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";
import Item from "shared/item/Item";
import { useItemViewport } from "shared/item/ItemViewport";
import Furnace from "shared/item/traits/Furnace";
import Generator from "shared/item/traits/generator/Generator";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import Packets from "shared/Packets";

type OrbPart = Part & {
    Ground: Attachment & {
        Rim: ParticleEmitter;
    };
    Attach1: Attachment & {
        W1: ParticleEmitter;
        Cresents: ParticleEmitter;
        Sparks: ParticleEmitter;
        Rim: ParticleEmitter;
        Background: ParticleEmitter;
        RimSparks: ParticleEmitter;
        ["Black Ball"]: ParticleEmitter;
        W2: ParticleEmitter;
    };
};

const difficultyPacket = property<string | undefined>();
const setDifficultyPacket = packet<(difficultyId: string) => boolean>();
const addResearchPacket = packet<(entries: Array<[string, number]>) => boolean>();
const removeResearchPacket = packet<(entries: Array<[string, number]>) => boolean>();

type ItemQuantityEntry = { item: Item; amount: number };

interface OrbEmitterDefaults {
    emitter: ParticleEmitter;
    baseSize: NumberSequence;
    baseColor: ColorSequence;
    baseMaxSize: number;
}

interface OrbAttachmentDefaults {
    attachment: Attachment;
    basePosition: Vector3;
}

interface OrbVisualDefaults {
    emitters: OrbEmitterDefaults[];
    maxBaseSize: number;
    attach1?: OrbAttachmentDefaults;
}

function scaleNumberSequence(sequence: NumberSequence, scale: number) {
    const keypoints = sequence.Keypoints.map(
        (keypoint) => new NumberSequenceKeypoint(keypoint.Time, keypoint.Value * scale, keypoint.Envelope * scale),
    );
    return new NumberSequence(keypoints);
}

function computeNumberSequenceMaxRadius(sequence: NumberSequence) {
    let maxValue = 0;
    for (const keypoint of sequence.Keypoints) {
        const value = keypoint.Value + keypoint.Envelope;
        if (value > maxValue) {
            maxValue = value;
        }
    }
    return maxValue;
}

function shiftColorSequence(sequence: ColorSequence, hueShift: number) {
    const keypoints = sequence.Keypoints.map((keypoint) => {
        const [h, s, v] = Color3.toHSV(keypoint.Value);
        let shiftedHue = (h + hueShift) % 1;
        if (shiftedHue < 0) {
            shiftedHue += 1;
        }
        const shiftedColor = Color3.fromHSV(shiftedHue, s, v);
        return new ColorSequenceKeypoint(keypoint.Time, shiftedColor);
    });
    return new ColorSequence(keypoints);
}

function computeOrbVisualTargets(multiplier: BaseOnoeNum) {
    const mantissa = math.max(multiplier.mantissa, 1e-6);
    const exponent = multiplier.exponent ?? 0;
    const magnitude = math.max(math.log10(mantissa) + exponent, 0);
    const easedMagnitude = math.clamp(magnitude, 0, 12);
    const sizeScale = math.clamp(1 + easedMagnitude * 0.12, 0.8, 3.5);
    const hueShift = math.fmod(easedMagnitude * 0.08, 1);
    return {
        sizeScale,
        hueShift,
    };
}

interface TabSwitcherProps {
    activePage: "difficulties" | "research";
    onChange: (page: "difficulties" | "research") => void;
}

function TabSwitcher({ activePage, onChange }: TabSwitcherProps) {
    return (
        <frame BackgroundTransparency={1} LayoutOrder={0} Size={new UDim2(1, 0, 0, 44)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 12)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <textbutton
                LayoutOrder={0}
                BackgroundColor3={
                    activePage === "difficulties" ? Color3.fromRGB(80, 80, 140) : Color3.fromRGB(45, 45, 70)
                }
                BackgroundTransparency={0.1}
                BorderSizePixel={0}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.5, -6, 1, 0)}
                Text="Difficulties"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                Event={{
                    Activated: () => {
                        playSound("MenuClick.mp3");
                        onChange("difficulties");
                    },
                }}
            >
                <uicorner CornerRadius={new UDim(0, 6)} />
            </textbutton>
            <textbutton
                LayoutOrder={1}
                BackgroundColor3={activePage === "research" ? Color3.fromRGB(80, 80, 140) : Color3.fromRGB(45, 45, 70)}
                BackgroundTransparency={0.1}
                BorderSizePixel={0}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.5, -6, 1, 0)}
                Text="Research"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                Event={{
                    Activated: () => {
                        playSound("MenuClick.mp3");
                        onChange("research");
                    },
                }}
            >
                <uicorner CornerRadius={new UDim(0, 6)} />
            </textbutton>
        </frame>
    );
}

interface DifficultyCarouselProps {
    difficultyList: Difficulty[];
    selectPart: BasePart;
    requirements: Map<string, OnoeNum>;
    playerDifficultyPower: OnoeNum;
    unlockedDifficulties: Set<string>;
    claimableDifficulties: Set<string>;
}

function DifficultyCarousel({
    difficultyList,
    selectPart,
    requirements,
    unlockedDifficulties,
    claimableDifficulties,
}: DifficultyCarouselProps) {
    return (
        <scrollingframe
            LayoutOrder={2}
            Active={true}
            AutomaticCanvasSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            BorderSizePixel={0}
            CanvasSize={new UDim2(0, 0, 0, 110)}
            HorizontalScrollBarInset={Enum.ScrollBarInset.ScrollBar}
            ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
            ScrollingDirection={Enum.ScrollingDirection.X}
            Size={new UDim2(1, 0, 0, 110)}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                Padding={new UDim(0, 16)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
            <uipadding
                PaddingBottom={new UDim(0, 8)}
                PaddingLeft={new UDim(0, 8)}
                PaddingRight={new UDim(0, 8)}
                PaddingTop={new UDim(0, 8)}
            />
            {difficultyList.map((difficulty) => {
                const requirement = requirements.get(difficulty.id);
                const isUnlocked = unlockedDifficulties.has(difficulty.id);
                const baseColor = difficulty.color ?? Color3.fromRGB(50, 50, 80);
                const displayColor = isUnlocked ? baseColor : baseColor.Lerp(Color3.fromRGB(20, 20, 30), 0.6);
                const borderColor = displayColor.Lerp(Color3.fromRGB(0, 0, 0), 0.8);

                return (
                    <imagebutton
                        key={difficulty.id}
                        Active={isUnlocked}
                        AutoButtonColor={false}
                        BackgroundColor3={displayColor}
                        BorderColor3={borderColor}
                        BorderSizePixel={2}
                        Image={difficulty.image}
                        ImageTransparency={isUnlocked ? 0 : 0.5}
                        LayoutOrder={difficulty.layoutRating}
                        Size={new UDim2(0, 90, 0, 90)}
                        Event={{
                            Activated: () => {
                                if (!isUnlocked) {
                                    playSound("Error.mp3", selectPart);
                                    return;
                                }
                                const success = setDifficultyPacket.toServer(difficulty.id);
                                playSound(success ? "Click.mp3" : "Error.mp3", selectPart);
                            },
                            MouseEnter: (rbx) => {
                                if (!isUnlocked) return;
                                TweenService.Create(rbx, new TweenInfo(0.1), {
                                    ImageTransparency: 0.5,
                                }).Play();
                            },
                            MouseLeave: (rbx) => {
                                if (!isUnlocked) return;
                                TweenService.Create(rbx, new TweenInfo(0.1), {
                                    ImageTransparency: 0,
                                }).Play();
                            },
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 6)} />
                        {requirement !== undefined ? (
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Size={new UDim2(1, -8, 0, 20)}
                                Position={new UDim2(0, 4, 1, -8)}
                                AnchorPoint={new Vector2(0, 1)}
                                Text={`${OnoeNum.toString(requirement)} DP`}
                                TextColor3={isUnlocked ? Color3.fromRGB(171, 171, 255) : Color3.fromRGB(237, 163, 186)}
                                TextScaled={true}
                                TextWrapped={true}
                                TextStrokeTransparency={0.3}
                            />
                        ) : (
                            <Fragment />
                        )}
                        {!isUnlocked ? (
                            <imagelabel
                                BackgroundTransparency={1}
                                Image={getAsset("assets/Lock.png")}
                                ImageColor3={Color3.fromRGB(255, 200, 220)}
                                ImageTransparency={0.1}
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                Size={new UDim2(0.4, 0, 0.4, 0)}
                                ZIndex={2}
                            />
                        ) : (
                            <Fragment />
                        )}
                        {claimableDifficulties.has(difficulty.id) ? (
                            <frame
                                AnchorPoint={new Vector2(1, 0)}
                                BackgroundColor3={Color3.fromRGB(215, 60, 60)}
                                BorderSizePixel={0}
                                Position={new UDim2(1, -6, 0, 6)}
                                Size={new UDim2(0, 20, 0, 20)}
                                ZIndex={3}
                            >
                                <uicorner CornerRadius={new UDim(1, 0)} />
                                <textlabel
                                    AnchorPoint={new Vector2(0.5, 0.5)}
                                    BackgroundTransparency={1}
                                    FontFace={RobotoMonoBold}
                                    Position={new UDim2(0.5, 0, 0.5, 0)}
                                    Size={new UDim2(1, 0, 1, 0)}
                                    Text="!"
                                    TextColor3={Color3.fromRGB(255, 255, 255)}
                                    TextScaled={true}
                                />
                            </frame>
                        ) : (
                            <Fragment />
                        )}
                    </imagebutton>
                );
            })}
        </scrollingframe>
    );
}

interface DifficultySelectionSurfaceProps {
    activePage: "difficulties" | "research";
    setActivePage: (page: "difficulties" | "research") => void;
    difficultyList: Difficulty[];
    selectPart: BasePart;
    difficultyRequirements: Map<string, OnoeNum>;
    playerDifficultyPower: OnoeNum;
    nextUnlockRequirement?: OnoeNum;
    unlockedDifficulties: Set<string>;
    claimableDifficulties: Set<string>;
}

function DifficultySelectionSurface({
    activePage,
    setActivePage,
    difficultyList,
    selectPart,
    difficultyRequirements,
    playerDifficultyPower,
    nextUnlockRequirement,
    unlockedDifficulties,
    claimableDifficulties,
}: DifficultySelectionSurfaceProps) {
    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <uipadding
                PaddingBottom={new UDim(0, 12)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
                PaddingTop={new UDim(0, 12)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 3)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <TabSwitcher activePage={activePage} onChange={setActivePage} />
            <textlabel
                LayoutOrder={1}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Size={new UDim2(1, 0, 0, 20)}
                Text={`Difficulty Power: ${OnoeNum.toString(playerDifficultyPower)}${
                    nextUnlockRequirement !== undefined
                        ? ` | Next unlock: ${OnoeNum.toString(nextUnlockRequirement)} DP`
                        : ""
                }`}
                TextColor3={Color3.fromRGB(200, 200, 240)}
                TextStrokeTransparency={0}
                TextScaled={true}
                TextWrapped={true}
            />
            <DifficultyCarousel
                difficultyList={difficultyList}
                selectPart={selectPart}
                requirements={difficultyRequirements}
                playerDifficultyPower={playerDifficultyPower}
                unlockedDifficulties={unlockedDifficulties}
                claimableDifficulties={claimableDifficulties}
            />
        </frame>
    );
}

interface ResearchInfoProps {
    availableEntries: ItemQuantityEntry[];
    researchEntries: ItemQuantityEntry[];
    totalResearchCount: number;
    researchMultiplier: BaseOnoeNum;
    onAbsorb: (itemId: string, amount: number) => void;
    onRelease: (itemId: string, amount: number) => void;
    onAbsorbAll: () => void;
    onReleaseAll: () => void;
}

const ITEM_ROW_HEIGHT = 36;
const ITEM_ROW_SPACING = 8;
const MAX_VISIBLE_ITEM_LIST_HEIGHT = 320;

interface VirtualizedListRenderContext {
    position: UDim2;
    size: UDim2;
}

interface VirtualizedItemListProps<T> {
    items: T[];
    itemHeight: number;
    itemSpacing?: number;
    maxVisibleHeight: number;
    layoutOrder?: number;
    renderItem: (item: T, index: number, context: VirtualizedListRenderContext) => React.ReactElement;
}

function VirtualizedItemList<T>({
    items,
    itemHeight,
    itemSpacing = 0,
    maxVisibleHeight,
    layoutOrder,
    renderItem,
}: VirtualizedItemListProps<T>) {
    const scrollingRef = useRef<ScrollingFrame>();
    const [scrollPosition, setScrollPosition] = useState(0);

    const totalItemHeight = useMemo(() => {
        const count = items.size();
        if (count <= 0) return 0;
        return count * itemHeight + math.max(count - 1, 0) * itemSpacing;
    }, [items, itemHeight, itemSpacing]);

    const visibleHeight = math.min(math.max(totalItemHeight, itemHeight), maxVisibleHeight);
    const canvasHeight = math.max(totalItemHeight, visibleHeight);
    const virtualRowHeight = itemHeight + itemSpacing;

    useEffect(() => {
        const scrollingFrame = scrollingRef.current;
        if (!scrollingFrame) return;

        const clampScroll = () => {
            const maxScroll = math.max(canvasHeight - visibleHeight, 0);
            if (scrollingFrame.CanvasPosition.Y > maxScroll) {
                scrollingFrame.CanvasPosition = new Vector2(scrollingFrame.CanvasPosition.X, maxScroll);
            }
            setScrollPosition(scrollingFrame.CanvasPosition.Y);
        };

        clampScroll();

        const canvasConnection = scrollingFrame.GetPropertyChangedSignal("CanvasPosition").Connect(() => {
            setScrollPosition(scrollingFrame.CanvasPosition.Y);
        });

        return () => {
            canvasConnection.Disconnect();
        };
    }, [canvasHeight, visibleHeight, items]);

    if (items.size() <= 0) {
        return <Fragment />;
    }

    const overscan = 6;
    const startIndex = math.max(math.floor(scrollPosition / virtualRowHeight) - overscan, 0);
    const endIndex = math.min(math.ceil((scrollPosition + visibleHeight) / virtualRowHeight) + overscan, items.size());

    const renderedItems: React.ReactElement[] = [];
    for (let index = startIndex; index < endIndex; index++) {
        const item = items[index];
        if (item === undefined) continue;
        const offset = index * virtualRowHeight;
        renderedItems.push(
            renderItem(item, index, {
                position: new UDim2(0, 0, 0, offset),
                size: new UDim2(1, -12, 0, itemHeight),
            }),
        );
    }

    return (
        <scrollingframe
            ref={scrollingRef}
            LayoutOrder={layoutOrder}
            Active={true}
            BackgroundTransparency={1}
            BorderSizePixel={0}
            CanvasSize={new UDim2(0, 0, 0, canvasHeight)}
            ScrollBarThickness={6}
            ScrollingDirection={Enum.ScrollingDirection.Y}
            Size={new UDim2(1, 0, 0, visibleHeight)}
        >
            <uipadding
                PaddingBottom={new UDim(0, 4)}
                PaddingLeft={new UDim(0, 6)}
                PaddingRight={new UDim(0, 6)}
                PaddingTop={new UDim(0, 4)}
            />
            {renderedItems}
        </scrollingframe>
    );
}

function AvailableEntryRow({
    item,
    amount,
    onAbsorb,
    position,
    size,
}: ItemQuantityEntry & {
    onAbsorb: (itemId: string, amount: number) => void;
    position: UDim2;
    size: UDim2;
}) {
    const color = item.difficulty.color ?? Color3.fromRGB(60, 60, 110);
    const backgroundColor = new Color3(
        math.clamp(color.R, 0.1, 0.9),
        math.clamp(color.G, 0.1, 0.9),
        math.clamp(color.B, 0.1, 0.9),
    );
    return (
        <imagelabel
            BackgroundColor3={backgroundColor}
            BackgroundTransparency={0.2}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={3}
            Image={getAsset("assets/Grid.png")}
            ImageColor3={Color3.fromRGB(126, 126, 126)}
            ImageTransparency={0.6}
            ScaleType={Enum.ScaleType.Tile}
            Position={position}
            Size={size}
            TileSize={new UDim2(0, 100, 0, 100)}
        >
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={backgroundColor}
                Thickness={2}
                Transparency={0.2}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(236, 236, 236)),
                            new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                            new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(220, 220, 220)),
                        ])
                    }
                    Rotation={35}
                />
            </uistroke>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(39, 39, 39)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(58, 58, 58)),
                    ])
                }
                Rotation={270}
            />
            <uipadding
                PaddingBottom={new UDim(0, 8)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
                PaddingTop={new UDim(0, 8)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                Padding={new UDim(0, 8)}
                HorizontalAlignment={Enum.HorizontalAlignment.Right}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, -236, 1, 0)}
                Text={`${item.name} (${amount})`}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
            </textlabel>
            <textbutton
                BackgroundColor3={Color3.fromRGB(35, 35, 60)}
                BackgroundTransparency={0.2}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0, 90, 1, 0)}
                Text="+1"
                TextColor3={Color3.fromRGB(235, 235, 255)}
                TextScaled={true}
                Event={{
                    Activated: () => onAbsorb(item.id, 1),
                }}
            />
            <textbutton
                BackgroundColor3={Color3.fromRGB(50, 50, 90)}
                BackgroundTransparency={0.2}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0, 110, 1, 0)}
                Text="+All"
                TextColor3={Color3.fromRGB(235, 235, 255)}
                TextScaled={true}
                Event={{
                    Activated: () => onAbsorb(item.id, amount),
                }}
            />
        </imagelabel>
    );
}

function ActiveResearchRow({
    item,
    amount,
    onRelease,
    position,
    size,
}: ItemQuantityEntry & {
    onRelease: (itemId: string, amount: number) => void;
    position: UDim2;
    size: UDim2;
}) {
    const color = item.difficulty.color?.Lerp(Color3.fromRGB(0, 0, 0), 0.4) ?? Color3.fromRGB(50, 40, 90);
    const backgroundColor = new Color3(
        math.clamp(color.R, 0.1, 0.9),
        math.clamp(color.G, 0.1, 0.9),
        math.clamp(color.B, 0.1, 0.9),
    );
    return (
        <imagelabel
            BackgroundColor3={backgroundColor}
            BackgroundTransparency={0.2}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={3}
            Image={getAsset("assets/Grid.png")}
            ImageColor3={Color3.fromRGB(126, 126, 126)}
            ImageTransparency={0.6}
            ScaleType={Enum.ScaleType.Tile}
            Position={position}
            Size={size}
            TileSize={new UDim2(0, 100, 0, 100)}
        >
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={backgroundColor}
                Thickness={2}
                Transparency={0.2}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(236, 236, 236)),
                            new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                            new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(220, 220, 220)),
                        ])
                    }
                    Rotation={35}
                />
            </uistroke>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(39, 39, 39)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(58, 58, 58)),
                    ])
                }
                Rotation={270}
            />
            <uipadding
                PaddingBottom={new UDim(0, 8)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
                PaddingTop={new UDim(0, 8)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                Padding={new UDim(0, 8)}
                HorizontalAlignment={Enum.HorizontalAlignment.Right}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, -236, 1, 0)}
                Text={`${item.name} (${amount})`}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            />
            <textbutton
                BackgroundColor3={Color3.fromRGB(70, 35, 70)}
                BackgroundTransparency={0.2}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0, 90, 1, 0)}
                Text="-1"
                TextColor3={Color3.fromRGB(255, 220, 240)}
                TextScaled={true}
                Event={{
                    Activated: () => onRelease(item.id, 1),
                }}
            />
            <textbutton
                BackgroundColor3={Color3.fromRGB(90, 45, 100)}
                BackgroundTransparency={0.2}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0, 130, 1, 0)}
                Text="Release"
                TextColor3={Color3.fromRGB(255, 220, 240)}
                TextScaled={true}
                Event={{
                    Activated: () => onRelease(item.id, amount),
                }}
            />
        </imagelabel>
    );
}

function ResearchPanel({
    availableEntries,
    researchEntries,
    totalResearchCount,
    researchMultiplier,
    onAbsorb,
    onRelease,
    onAbsorbAll,
    onReleaseAll,
}: ResearchInfoProps) {
    const availableCount = useMemo(() => {
        let count = 0;
        for (const entry of availableEntries) {
            count += entry.amount;
        }
        return count;
    }, [availableEntries]);

    const handleAbsorbAll = useCallback(() => {
        onAbsorbAll();
    }, [onAbsorbAll]);

    const handleReleaseAll = useCallback(() => {
        onReleaseAll();
    }, [onReleaseAll]);

    return (
        <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                SortOrder={Enum.SortOrder.LayoutOrder}
                Padding={new UDim(0, 8)}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                LayoutOrder={0}
                Size={new UDim2(1, 0, 0, 28)}
                Text="Feed spare items to amplify difficulty power. Release them anytime."
                TextColor3={Color3.fromRGB(180, 180, 220)}
                TextStrokeTransparency={0}
                TextScaled={true}
                TextWrapped={true}
            />

            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                LayoutOrder={1}
                Size={new UDim2(1, 0, 0, 32)}
                Text={`Available (${availableCount})`}
                TextColor3={Color3.fromRGB(210, 210, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
            </textlabel>
            {availableCount <= 0 ? (
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    LayoutOrder={2}
                    Size={new UDim2(1, 0, 0, 28)}
                    Text="No available items to research."
                    TextColor3={Color3.fromRGB(200, 200, 200)}
                    TextStrokeTransparency={0}
                    TextScaled={true}
                />
            ) : (
                <Fragment>
                    <VirtualizedItemList
                        items={availableEntries}
                        itemHeight={ITEM_ROW_HEIGHT}
                        itemSpacing={ITEM_ROW_SPACING}
                        layoutOrder={3}
                        maxVisibleHeight={MAX_VISIBLE_ITEM_LIST_HEIGHT}
                        renderItem={(entry, _index, context) => (
                            <AvailableEntryRow
                                key={`inventory-${entry.item.id}`}
                                item={entry.item}
                                amount={entry.amount}
                                onAbsorb={onAbsorb}
                                position={context.position}
                                size={context.size}
                            />
                        )}
                    />
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(90, 110, 190)}
                        BackgroundTransparency={0.2}
                        BorderColor3={Color3.fromRGB(41, 41, 41)}
                        BorderSizePixel={3}
                        FontFace={RobotoMonoBold}
                        LayoutOrder={3}
                        Size={new UDim2(0.5, 0, 0, 30)}
                        Text="Absorb All"
                        TextColor3={Color3.fromRGB(235, 235, 255)}
                        TextScaled={true}
                        Event={{
                            Activated: handleAbsorbAll,
                        }}
                    >
                        <uistroke
                            ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                            Color={Color3.fromRGB(191, 200, 255)}
                            Thickness={1}
                        />
                    </textbutton>
                </Fragment>
            )}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                LayoutOrder={4}
                Size={new UDim2(1, 0, 0, 40)}
                Text={`Researching (${totalResearchCount})`}
                TextColor3={Color3.fromRGB(210, 210, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
                <uipadding PaddingTop={new UDim(0, 8)} />
            </textlabel>
            {totalResearchCount <= 0 ? (
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    LayoutOrder={5}
                    Size={new UDim2(1, 0, 0, 28)}
                    Text="No active research."
                    TextColor3={Color3.fromRGB(200, 200, 200)}
                    TextStrokeTransparency={0}
                    TextScaled={true}
                />
            ) : (
                <VirtualizedItemList
                    items={researchEntries}
                    itemHeight={ITEM_ROW_HEIGHT}
                    itemSpacing={ITEM_ROW_SPACING}
                    layoutOrder={5}
                    maxVisibleHeight={MAX_VISIBLE_ITEM_LIST_HEIGHT}
                    renderItem={(entry, _index, context) => (
                        <ActiveResearchRow
                            key={`research-${entry.item.id}`}
                            item={entry.item}
                            amount={entry.amount}
                            onRelease={onRelease}
                            position={context.position}
                            size={context.size}
                        />
                    )}
                />
            )}
            {totalResearchCount > 0 ? (
                <textbutton
                    BackgroundColor3={Color3.fromRGB(120, 60, 120)}
                    BackgroundTransparency={0.2}
                    BorderColor3={Color3.fromRGB(41, 41, 41)}
                    BorderSizePixel={3}
                    FontFace={RobotoMonoBold}
                    LayoutOrder={6}
                    Size={new UDim2(0.5, 0, 0, 30)}
                    Text="Release All"
                    TextColor3={Color3.fromRGB(255, 220, 240)}
                    TextScaled={true}
                    Event={{
                        Activated: handleReleaseAll,
                    }}
                >
                    <uistroke
                        ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                        Color={Color3.fromRGB(255, 191, 252)}
                        Thickness={1}
                    />
                </textbutton>
            ) : (
                <Fragment />
            )}
        </frame>
    );
}

interface DifficultyRewardCardProps {
    layoutOrder: number;
    reward: DifficultyReward;
    playerDifficultyPower: OnoeNum;
    cooldowns: Map<string, number>;
    purchases: Map<string, number>;
    onClaim: (rewardId: string) => void;
}

function DifficultyRewardCard({
    layoutOrder,
    reward,
    playerDifficultyPower,
    cooldowns,
    purchases,
    onClaim,
}: DifficultyRewardCardProps) {
    const [costText, cost] = useMemo(
        () => reward.getPriceLabel(playerDifficultyPower),
        [reward, playerDifficultyPower],
    );
    const viewportRef = useRef<ViewportFrame>();
    useItemViewport(viewportRef, reward.viewportItemId ?? "");

    const purchaseCount = purchases.get(reward.id) ?? 0;
    const maxClaims = reward.maxClaims;
    const hasReachedMaxClaims = maxClaims !== undefined && purchaseCount >= maxClaims;

    const cooldownExpiresAt = cooldowns.get(reward.id);
    const computeSecondsRemaining = useCallback(() => {
        if (cooldownExpiresAt === undefined) return 0;
        return math.max(cooldownExpiresAt - os.time(), 0);
    }, [cooldownExpiresAt]);

    const [secondsRemaining, setSecondsRemaining] = useState(() => computeSecondsRemaining());

    useEffect(() => {
        setSecondsRemaining(computeSecondsRemaining());
        if (cooldownExpiresAt === undefined) return;
        let alive = true;
        task.spawn(() => {
            while (alive) {
                const remaining = computeSecondsRemaining();
                setSecondsRemaining(remaining);
                if (remaining <= 0) break;
                task.wait(1);
            }
        });
        return () => {
            alive = false;
        };
    }, [computeSecondsRemaining, cooldownExpiresAt]);

    const isCoolingDown = secondsRemaining > 0;
    const isAffordable = !playerDifficultyPower.lessThan(cost);

    const payoutText = useMemo(() => reward.getEffectsLabel(), [reward]);

    let recipeCostText: string | undefined;
    for (const effect of reward.effects) {
        if (effect.kind !== "forgeItem") continue;

        const item = Server.Items.itemsPerId.get(effect.itemId);
        if (item === undefined) {
            recipeCostText = undefined;
            break;
        }

        const amount = math.max(effect.amount ?? 1, 1);
        let totalPrice = new CurrencyBundle();
        const bought = Server.Item?.getBoughtAmount?.(item.id) ?? 0;
        for (let iteration = 1; iteration <= amount; iteration++) {
            const price = item.getPrice(bought + iteration);
            if (price !== undefined) {
                totalPrice = totalPrice.add(price);
            }
        }

        const components = new Array<string>();
        if (totalPrice.amountPerCurrency.size() > 0) {
            const priceString = CurrencyBundle.currenciesToString(totalPrice.amountPerCurrency, true);
            if (priceString !== "") {
                components.push(priceString);
            }
        }

        const requiredLabels = new Array<string>();
        for (const [requiredId, requiredAmount] of item.requiredItems) {
            const requiredItem = Server.Items.itemsPerId.get(requiredId);
            const totalRequired = requiredAmount * amount;
            requiredLabels.push(`${requiredItem?.name ?? requiredId} x${totalRequired}`);
        }
        if (requiredLabels.size() > 0) {
            components.push(requiredLabels.join(", "));
        }

        if (!components.isEmpty()) {
            recipeCostText = components.join(" + ");
        }
        break;
    }

    const dpCostIsFree = costText === "Free!" && cost.lessEquals(0);
    const costLines = new Array<string>();
    if (!dpCostIsFree) {
        costLines.push(`<font color="#FFC0FF">${costText}</font>`);
    }
    if (recipeCostText !== undefined) {
        costLines.push(recipeCostText);
    }

    let costLabelRich = 'Cost: <font color="#FFC0FF">Free!</font>';
    if (!costLines.isEmpty()) {
        costLabelRich = `Cost: ${costLines.join("<br/>")}`;
    }

    let statusColor = Color3.fromRGB(255, 200, 150);
    if (hasReachedMaxClaims) {
        statusColor = Color3.fromRGB(185, 205, 255);
    } else if (isCoolingDown) {
        statusColor = Color3.fromRGB(255, 139, 170);
    } else if (isAffordable) {
        statusColor = Color3.fromRGB(165, 255, 181);
    }

    let buttonText = "Cannot Afford";
    if (hasReachedMaxClaims) {
        buttonText = "Claimed";
    } else if (isCoolingDown) {
        buttonText = DifficultyReward.formatDurationShort(secondsRemaining);
    } else if (isAffordable) {
        buttonText = "Claim Reward";
    }

    const buttonDisabled = hasReachedMaxClaims || isCoolingDown || !isAffordable;

    return (
        <frame
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundColor3={Color3.fromRGB(45, 45, 80)}
            BackgroundTransparency={0.1}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 0)}
        >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uistroke Color={Color3.fromRGB(25, 25, 45)} Thickness={2} />
            <uipadding
                PaddingBottom={new UDim(0, 12)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
                PaddingTop={new UDim(0, 12)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 6)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
            <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    Padding={new UDim(0, 6)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                />
                {reward.viewportItemId !== undefined ? (
                    <viewportframe
                        ref={viewportRef}
                        Ambient={new Color3(0.6, 0.6, 0.6)}
                        LightDirection={new Vector3(0, -1, -0.5)}
                        LightColor={new Color3(1, 1, 1)}
                        BackgroundTransparency={1}
                        Size={new UDim2(0, 32, 0, 32)}
                    />
                ) : (
                    <imagelabel
                        BackgroundTransparency={1}
                        Size={new UDim2(0, 26, 0, 26)}
                        Image={reward.icon}
                        ScaleType={Enum.ScaleType.Fit}
                    />
                )}
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={reward.title}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={26}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
            </frame>

            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Size={new UDim2(1, 0, 0, 0)}
                Text={reward.description}
                TextColor3={Color3.fromRGB(210, 210, 255)}
                TextSize={20}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            />
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                RichText={true}
                Size={new UDim2(1, 0, 0, 0)}
                Text={costLabelRich}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={20}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            />
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                RichText={true}
                Size={new UDim2(1, 0, 0, 0)}
                Text={payoutText}
                TextColor3={Color3.fromRGB(220, 220, 255)}
                TextSize={20}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            />
            {maxClaims !== undefined ? (
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={`Claims: ${math.min(purchaseCount, maxClaims)} / ${maxClaims}`}
                    TextColor3={statusColor}
                    TextSize={20}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
            ) : (
                <Fragment />
            )}

            <textbutton
                Active={!buttonDisabled}
                AutoButtonColor={!buttonDisabled}
                BackgroundColor3={buttonDisabled ? Color3.fromRGB(70, 70, 110) : Color3.fromRGB(120, 80, 180)}
                BackgroundTransparency={0.1}
                BorderSizePixel={0}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0, 160, 0, 48)}
                Text={buttonText}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={20}
                Event={{
                    Activated: () => {
                        if (buttonDisabled) return;
                        onClaim(reward.id);
                    },
                }}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
            </textbutton>
        </frame>
    );
}

interface DifficultyRewardsSectionProps {
    rewards: DifficultyReward[];
    playerDifficultyPower: OnoeNum;
    cooldowns: Map<string, number>;
    purchases: Map<string, number>;
    onClaim: (rewardId: string) => void;
}

function DifficultyRewardsSection({
    rewards,
    playerDifficultyPower,
    cooldowns,
    purchases,
    onClaim,
}: DifficultyRewardsSectionProps) {
    return (
        <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 8)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 0, 45)}
                Text="Difficulty Rewards"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={3} />
                <uipadding PaddingTop={new UDim(0, 15)} />
            </textlabel>
            {rewards.isEmpty() ? (
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text="No rewards configured for this difficulty yet."
                    TextColor3={Color3.fromRGB(200, 200, 220)}
                    TextSize={24}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
            ) : (
                <Fragment />
            )}
            {rewards.map((reward, index) => (
                <DifficultyRewardCard
                    key={`reward-${reward.id}`}
                    layoutOrder={index + 1}
                    reward={reward}
                    playerDifficultyPower={playerDifficultyPower}
                    cooldowns={cooldowns}
                    purchases={purchases}
                    onClaim={onClaim}
                />
            ))}
        </frame>
    );
}

interface DescriptionPanelProps {
    activePage: "difficulties" | "research";
    description: string;
    researchInfo: ResearchInfoProps;
    rewardInfo: DifficultyRewardsSectionProps;
    hasDifficultySelected: boolean;
}

function DescriptionPanel({
    activePage,
    description,
    researchInfo,
    rewardInfo,
    hasDifficultySelected,
}: DescriptionPanelProps) {
    return (
        <scrollingframe
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            BorderSizePixel={0}
            CanvasSize={new UDim2(1, 0, 0, 0)}
            Size={new UDim2(1, 0, 1, 0)}
            ScrollingDirection={Enum.ScrollingDirection.Y}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                SortOrder={Enum.SortOrder.LayoutOrder}
                Padding={new UDim(0, 8)}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
            <uipadding
                PaddingBottom={new UDim(0, 16)}
                PaddingLeft={new UDim(0, 16)}
                PaddingRight={new UDim(0, 16)}
                PaddingTop={new UDim(0, 16)}
            />

            <frame
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 0, 0)}
                Visible={activePage === "research"}
            >
                <ResearchPanel {...researchInfo} />
            </frame>

            <frame
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 0, 0)}
                Visible={activePage === "difficulties"}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    Padding={new UDim(0, 8)}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                />
                {hasDifficultySelected ? (
                    <Fragment>
                        <textlabel
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundTransparency={1}
                            FontFace={RobotoMono}
                            RichText={true}
                            Size={new UDim2(1, 0, 0, 0)}
                            Text={description}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={24}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            TextYAlignment={Enum.TextYAlignment.Top}
                        >
                            <uistroke Thickness={3} />
                        </textlabel>
                        <DifficultyRewardsSection
                            rewards={rewardInfo.rewards}
                            playerDifficultyPower={rewardInfo.playerDifficultyPower}
                            cooldowns={rewardInfo.cooldowns}
                            purchases={rewardInfo.purchases}
                            onClaim={rewardInfo.onClaim}
                        />
                    </Fragment>
                ) : (
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(1, 0, 0, 0)}
                        Text="Feed the researcher with droplets and select a difficulty to preview its rewards."
                        TextColor3={Color3.fromRGB(220, 220, 255)}
                        TextSize={26}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Center}
                        TextYAlignment={Enum.TextYAlignment.Top}
                    />
                )}
            </frame>
        </scrollingframe>
    );
}

interface DifficultyNameSurfaceProps {
    currentDifficulty?: Difficulty;
}

function DifficultyNameSurface({ currentDifficulty }: DifficultyNameSurfaceProps) {
    return (
        <Fragment>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 1, 0)}
                Text={currentDifficulty?.name ?? ""}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={3} />
            </textlabel>
            <uipadding
                PaddingBottom={new UDim(0, 24)}
                PaddingLeft={new UDim(0, 16)}
                PaddingRight={new UDim(0, 16)}
                PaddingTop={new UDim(0, 24)}
            />
        </Fragment>
    );
}

interface MultiplierBillboardProps {
    orbPart: BasePart;
    billboardRef: RefObject<BillboardGui>;
    revenueLabelRef: RefObject<TextLabel>;
    gradientRef: RefObject<UIGradient>;
}

function MultiplierBillboard({ orbPart, billboardRef, revenueLabelRef, gradientRef }: MultiplierBillboardProps) {
    return (
        <billboardgui
            ref={billboardRef}
            Adornee={orbPart}
            AlwaysOnTop={true}
            LightInfluence={0}
            MaxDistance={100}
            Size={new UDim2(4, 0, 4, 0)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <textlabel
                ref={revenueLabelRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Text=""
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                Rotation={-5}
            >
                <uistroke StrokeSizingMode={Enum.StrokeSizingMode.ScaledSize} Thickness={0.1} />
                <uigradient ref={gradientRef} Color={new ColorSequence(Color3.fromRGB(255, 255, 255))} Rotation={90} />
            </textlabel>
        </billboardgui>
    );
}

function DifficultyResearcherGui({
    selectPart,
    descriptionPart,
    imagePart,
    namePart,
    orbPart,
    vortexPart,
}: {
    selectPart: BasePart;
    descriptionPart: BasePart;
    imagePart: BasePart;
    namePart: BasePart;
    orbPart: OrbPart;
    vortexPart: BasePart;
}) {
    const billboardRef = useRef<BillboardGui>();
    const revenueLabelRef = useRef<TextLabel>();
    const labelGradientRef = useRef<UIGradient>();
    const orbLightRef = useRef<PointLight>();
    const vortexLightRef = useRef<PointLight>();
    const activeLightTweens = useRef<Set<Tween>>(new Set());
    const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | undefined>(undefined);
    const [activePage, setActivePage] = useState<"difficulties" | "research">("difficulties");
    const [balance, setBalance] = useState<Map<Currency, BaseOnoeNum>>(Packets.balance.get());
    const [inventory, setInventory] = useState<Map<string, number>>(Packets.inventory.get());
    const [researchingState, setResearchingState] = useState<Map<string, number>>(Packets.researching.get());
    const [researchMultiplier, setResearchMultiplier] = useState(Packets.researchMultiplier.get());
    const [unlockedDifficulties, setUnlockedDifficulties] = useState<Set<string>>(Packets.unlockedDifficulties.get());
    const [rewardCooldowns, setRewardCooldowns] = useState<Map<string, number>>(
        Packets.difficultyRewardCooldowns.get(),
    );
    const [rewardPurchases, setRewardPurchases] = useState<Map<string, number>>(
        Packets.difficultyRewardPurchases.get(),
    );

    const orbVisualDefaults = useMemo<OrbVisualDefaults>(() => {
        const emitters = new Array<OrbEmitterDefaults>();
        let maxBaseSize = 0;
        for (const descendant of orbPart.GetDescendants()) {
            if (descendant.IsA("ParticleEmitter")) {
                const baseMaxSize = computeNumberSequenceMaxRadius(descendant.Size);
                if (baseMaxSize > maxBaseSize) {
                    maxBaseSize = baseMaxSize;
                }
                emitters.push({
                    emitter: descendant,
                    baseSize: descendant.Size,
                    baseColor: descendant.Color,
                    baseMaxSize,
                });
            }
        }

        const attach1 = orbPart.Attach1;

        return {
            emitters,
            maxBaseSize,
            attach1: attach1
                ? {
                      attachment: attach1,
                      basePosition: attach1.Position,
                  }
                : undefined,
        };
    }, [orbPart]);

    useEffect(() => {
        const { emitters, maxBaseSize, attach1 } = orbVisualDefaults;

        const { sizeScale, hueShift } = computeOrbVisualTargets(researchMultiplier);
        if (emitters.size() > 0) {
            for (const emitterDefaults of emitters) {
                emitterDefaults.emitter.Size = scaleNumberSequence(emitterDefaults.baseSize, sizeScale);
                emitterDefaults.emitter.Color = shiftColorSequence(emitterDefaults.baseColor, hueShift);
            }
        }

        if (attach1 !== undefined) {
            const baseHalfHeight = maxBaseSize * 0.5;
            const scaledHalfHeight = baseHalfHeight * sizeScale;
            const offsetY = math.max(scaledHalfHeight - baseHalfHeight, 0);
            const offsetVector = new Vector3(0, offsetY, 0);
            attach1.attachment.Position = attach1.basePosition.add(offsetVector);
            if (billboardRef.current) {
                billboardRef.current.StudsOffset = offsetVector;
            }
        }

        const label = revenueLabelRef.current;
        if (label !== undefined) {
            label.Size = new UDim2(10, 0, sizeScale - 0.8, 0);
        }

        const gradient = labelGradientRef.current;
        if (gradient !== undefined) {
            const startingHue = math.fmod(hueShift + 0.7, 1);
            const primaryHue = math.fmod(startingHue + 0.02, 1);
            const secondaryHue = math.fmod(primaryHue + 0.12, 1);
            const primary = Color3.fromHSV(primaryHue, 0.85, 1);
            const secondary = Color3.fromHSV(secondaryHue, 0.75, 0.9);
            gradient.Color = new ColorSequence([
                new ColorSequenceKeypoint(0, primary),
                new ColorSequenceKeypoint(1, secondary),
            ]);
        }
    }, [orbVisualDefaults, researchMultiplier]);

    const stopLightTweens = useCallback(() => {
        for (const tween of activeLightTweens.current) {
            tween.Cancel();
            tween.Destroy();
        }
        activeLightTweens.current.clear();
    }, []);

    useEffect(() => {
        const orbLight = new Instance("PointLight");
        orbLight.Brightness = 0;
        orbLight.Range = 0;
        orbLight.Color = Color3.fromRGB(255, 205, 255);
        orbLight.Parent = orbPart;
        orbLightRef.current = orbLight;

        const vortexLight = new Instance("PointLight");
        vortexLight.Brightness = 0;
        vortexLight.Range = 0;
        vortexLight.Color = Color3.fromRGB(255, 180, 255);
        vortexLight.Parent = vortexPart;
        vortexLightRef.current = vortexLight;

        return () => {
            stopLightTweens();
            orbLight.Destroy();
            vortexLight.Destroy();
        };
    }, [orbPart, vortexPart, stopLightTweens]);

    const triggerLightFlash = useCallback(() => {
        const orbLight = orbLightRef.current;
        const vortexLight = vortexLightRef.current;
        if (orbLight === undefined || vortexLight === undefined) return;

        stopLightTweens();

        const targets: Array<[PointLight, number, number]> = [
            [orbLight, 7, 18],
            [vortexLight, 9, 16],
        ];

        for (const [light, peakBrightness, peakRange] of targets) {
            light.Brightness = peakBrightness;
            light.Range = peakRange;
            const tween = TweenService.Create(
                light,
                new TweenInfo(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                {
                    Brightness: 0,
                    Range: math.max(peakRange * 0.35, 0),
                },
            );
            activeLightTweens.current.add(tween);
            tween.Completed.Once(() => {
                light.Brightness = 0;
                light.Range = 0;
                if (activeLightTweens.current.has(tween)) {
                    activeLightTweens.current.delete(tween);
                }
                tween.Destroy();
            });
            tween.Play();
        }
    }, [stopLightTweens]);

    useEffect(() => {
        const balanceConnection = Packets.balance.observe((incoming) => {
            setBalance(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const inventoryConnection = Packets.inventory.observe((incoming) => {
            setInventory(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const researchingConnection = Packets.researching.observe((incoming) => {
            setResearchingState(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const researchMultiplierConnection = Packets.researchMultiplier.observe((incoming) => {
            setResearchMultiplier(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const unlockedDifficultiesConnection = Packets.unlockedDifficulties.observe((incoming) => {
            setUnlockedDifficulties(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const rewardCooldownConnection = Packets.difficultyRewardCooldowns.observe((incoming) => {
            const mapped = incoming ?? new Map<string, number>();
            setRewardCooldowns(IS_EDIT ? table.clone(mapped) : mapped);
        });
        const rewardPurchaseConnection = Packets.difficultyRewardPurchases.observe((incoming) => {
            const mapped = incoming ?? new Map<string, number>();
            setRewardPurchases(IS_EDIT ? table.clone(mapped) : mapped);
        });
        return () => {
            balanceConnection.Disconnect();
            inventoryConnection.Disconnect();
            researchingConnection.Disconnect();
            researchMultiplierConnection.Disconnect();
            unlockedDifficultiesConnection.Disconnect();
            rewardCooldownConnection.Disconnect();
            rewardPurchaseConnection.Disconnect();
        };
    }, []);

    const difficultyList = useMemo(DifficultyResearch.collectUniqueDifficulties, []);

    const difficultyRequirements = useMemo(
        () => DifficultyResearch.buildDifficultyRequirements(difficultyList),
        [difficultyList],
    );

    const playerDifficultyPower = useMemo(() => new OnoeNum(balance.get("Difficulty Power") ?? 0), [balance]);

    const nextUnlockRequirement = useMemo(() => {
        for (const difficulty of difficultyList) {
            if (unlockedDifficulties.has(difficulty.id)) continue;
            const requirement = difficultyRequirements.get(difficulty.id);
            if (requirement === undefined) continue;
            if (playerDifficultyPower.lessThan(requirement)) {
                return requirement;
            }
        }
        return undefined;
    }, [difficultyList, difficultyRequirements, playerDifficultyPower, unlockedDifficulties]);

    const availableEntries = useMemo(() => {
        const entries = new Array<{ item: Item; amount: number }>();
        for (const item of Server.Items.sortedItems) {
            const itemId = item.id;
            if (!DifficultyResearch.isResearchEligible(item)) continue;
            const total = inventory.get(itemId) ?? 0;
            const reserved = researchingState.get(itemId) ?? 0;
            const available = total - reserved;
            if (available > 0) {
                entries.push({ item, amount: available });
            }
        }
        return entries;
    }, [inventory, researchingState]);

    const researchEntries = useMemo(() => {
        const entries = new Array<{ item: Item; amount: number }>();
        for (const item of Server.Items.sortedItems) {
            const itemId = item.id;
            const amount = researchingState.get(itemId) ?? 0;
            if (amount > 0) {
                entries.push({ item, amount });
            }
        }
        return entries;
    }, [researchingState]);

    const totalResearchCount = useMemo(() => {
        let total = 0;
        for (const [, amount] of researchingState) total += amount;
        return total;
    }, [researchingState]);

    const handleAbsorb = useCallback(
        (itemId: string, amount: number) => {
            if (amount < 1) return;
            const success = addResearchPacket.toServer([[itemId, amount]]);
            playSound(success ? "ResearchStart.mp3" : "Error.mp3", selectPart);
        },
        [selectPart],
    );

    const handleRelease = useCallback(
        (itemId: string, amount: number) => {
            if (amount < 1) return;
            const success = removeResearchPacket.toServer([[itemId, amount]]);
            playSound(success ? "ResearchEnd.mp3" : "Error.mp3");
        },
        [selectPart],
    );

    const handleAbsorbAll = useCallback(() => {
        const payload = new Array<[string, number]>();
        for (const entry of availableEntries) {
            if (entry.amount <= 0) continue;
            payload.push([entry.item.id, entry.amount]);
        }
        if (payload.isEmpty()) return;
        const success = addResearchPacket.toServer(payload);
        playSound(success ? "ResearchStart.mp3" : "Error.mp3", selectPart);
    }, [availableEntries, selectPart]);

    const handleReleaseAll = useCallback(() => {
        const payload = new Array<[string, number]>();
        for (const entry of researchEntries) {
            if (entry.amount <= 0) continue;
            payload.push([entry.item.id, entry.amount]);
        }
        if (payload.isEmpty()) return;
        const success = removeResearchPacket.toServer(payload);
        playSound(success ? "ResearchEnd.mp3" : "Error.mp3");
    }, [researchEntries]);

    useEffect(() => {
        const label = revenueLabelRef.current;
        if (label !== undefined) {
            label.Text = `x${OnoeNum.toString(researchMultiplier)}`;
        }
    }, [researchMultiplier]);

    useEffect(() => {
        const connection = difficultyPacket.observe((id) => {
            setCurrentDifficulty(id !== undefined ? Difficulty.get(id) : undefined);
        });
        return () => connection.Disconnect();
    }, []);

    const portal = useMemo(() => {
        return createPortal(<decal Texture={currentDifficulty?.image} />, imagePart);
    }, [currentDifficulty, imagePart]);

    const description = useMemo(() => {
        if (currentDifficulty === undefined) return "";
        let desc = currentDifficulty.description;
        if (desc === undefined) return "";
        [desc] = desc.gsub(`\\"`, '"'); // Escape quotes

        desc += `\n\nRating: ${currentDifficulty.visualRating}`;

        const currentRequirement = difficultyRequirements.get(currentDifficulty.id);
        if (currentRequirement !== undefined) {
            const requirementText = OnoeNum.toString(currentRequirement);
            const currentPowerText = OnoeNum.toString(playerDifficultyPower);
            const isUnlocked = unlockedDifficulties.has(currentDifficulty.id);
            const statusColor = isUnlocked ? "#A5FFB5" : "#FF8BAA";
            const statusText = isUnlocked ? "Unlocked" : `Locked until ${requirementText} Difficulty Power`;
            const statusLine = `<font color="${statusColor}">${statusText} — Requires ${requirementText} Difficulty Power (You have ${currentPowerText}).</font>`;
            desc = `${desc}\n\n${statusLine}`;
        }

        return desc;
    }, [
        currentDifficulty,
        difficultyRequirements,
        playerDifficultyPower,
        researchMultiplier,
        totalResearchCount,
        unlockedDifficulties,
    ]);

    const rewardRegistry = useMemo(() => DifficultyReward.setupDifficultyRewards(), []);
    const difficultyRewards = useMemo(
        () => rewardRegistry.getDifficultyRewards(currentDifficulty),
        [rewardRegistry, currentDifficulty],
    );

    const claimableDifficulties = useMemo(() => {
        const ready = new Set<string>();
        const now = os.time();
        for (const difficulty of difficultyList) {
            if (!unlockedDifficulties.has(difficulty.id)) continue;
            const rewards = rewardRegistry.getDifficultyRewards(difficulty);
            for (const reward of rewards) {
                const maxClaims = reward.maxClaims;
                const purchaseCount = rewardPurchases.get(reward.id) ?? 0;
                if (maxClaims !== undefined && purchaseCount >= maxClaims) continue;

                const cooldownExpiresAt = rewardCooldowns.get(reward.id);
                if (cooldownExpiresAt !== undefined && cooldownExpiresAt > now) continue;

                const [, cost] = reward.getPriceLabel(playerDifficultyPower);
                if (playerDifficultyPower.lessThan(cost)) continue;

                ready.add(difficulty.id);
                break;
            }
        }
        return ready;
    }, [difficultyList, unlockedDifficulties, rewardRegistry, rewardCooldowns, rewardPurchases, playerDifficultyPower]);

    const handleClaimReward = useCallback(
        (rewardId: string) => {
            const success = Packets.claimDifficultyReward.toServer(rewardId);
            playSound(success ? "UnlockItem.mp3" : "Error.mp3", selectPart);
            if (success) {
                triggerLightFlash();
            }
        },
        [selectPart, triggerLightFlash],
    );

    const researchInfo = useMemo<ResearchInfoProps>(
        () => ({
            availableEntries,
            researchEntries,
            totalResearchCount,
            researchMultiplier,
            onAbsorb: handleAbsorb,
            onRelease: handleRelease,
            onAbsorbAll: handleAbsorbAll,
            onReleaseAll: handleReleaseAll,
        }),
        [
            availableEntries,
            researchEntries,
            totalResearchCount,
            researchMultiplier,
            handleAbsorb,
            handleRelease,
            handleAbsorbAll,
            handleReleaseAll,
        ],
    );

    const rewardInfo = useMemo<DifficultyRewardsSectionProps>(
        () => ({
            rewards: difficultyRewards,
            playerDifficultyPower,
            cooldowns: rewardCooldowns,
            purchases: rewardPurchases,
            onClaim: handleClaimReward,
        }),
        [difficultyRewards, playerDifficultyPower, rewardCooldowns, rewardPurchases, handleClaimReward],
    );

    return (
        <Fragment>
            <surfacegui
                Adornee={selectPart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <DifficultySelectionSurface
                    activePage={activePage}
                    setActivePage={setActivePage}
                    difficultyList={difficultyList}
                    selectPart={selectPart}
                    difficultyRequirements={difficultyRequirements}
                    playerDifficultyPower={playerDifficultyPower}
                    nextUnlockRequirement={nextUnlockRequirement}
                    unlockedDifficulties={unlockedDifficulties}
                    claimableDifficulties={claimableDifficulties}
                />
            </surfacegui>
            <surfacegui
                Adornee={descriptionPart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <DescriptionPanel
                    activePage={activePage}
                    description={description}
                    researchInfo={researchInfo}
                    rewardInfo={rewardInfo}
                    hasDifficultySelected={currentDifficulty !== undefined}
                />
            </surfacegui>
            <surfacegui
                Adornee={namePart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <DifficultyNameSurface currentDifficulty={currentDifficulty} />
            </surfacegui>
            <MultiplierBillboard
                orbPart={orbPart}
                billboardRef={billboardRef}
                revenueLabelRef={revenueLabelRef}
                gradientRef={labelGradientRef}
            />
            {portal}
        </Fragment>
    );
}

export = new Item(script.Name)
    .setName("Difficulty Researcher")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setDescription("Learn about the world.")
    .setPrice(new CurrencyBundle().set("Funds", 15000), 1)
    .placeableEverywhere()
    .soldAt(ClassLowerNegativeShop)
    .persists()
    .unbreakable()

    .trait(Furnace)
    .setMul(CurrencyBundle.ones().mul(0))
    .acceptsGlobalBoosts(true)
    .acceptsUpgrades(true)
    .trait(Generator)
    .exit()

    .onInit(() => {
        const serverDifficultyList = DifficultyResearch.collectUniqueDifficulties();
        const serverDifficultyRequirements = DifficultyResearch.buildDifficultyRequirements(serverDifficultyList);

        setDifficultyPacket.fromClient((player, difficultyId) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;
            const difficulty = Difficulty.get(difficultyId);
            if (difficulty === undefined) return false;
            let requirement = serverDifficultyRequirements.get(difficulty.id);
            if (requirement === undefined) {
                const index = serverDifficultyList.findIndex((entry) => entry.id === difficulty.id);
                if (index === -1) return false;
                requirement = DifficultyResearch.getDifficultyRequirement(index);
                serverDifficultyRequirements.set(difficulty.id, requirement);
            }
            const alreadyUnlocked = Server.Research.unlockedDifficulties.has(difficulty.id);
            if (!alreadyUnlocked && requirement !== undefined) {
                const currentDifficultyPower = Server.Currency.get("Difficulty Power");
                if (currentDifficultyPower.lessThan(requirement)) return false;
            }
            difficultyPacket.set(difficulty.id);
            return true;
        });

        addResearchPacket.fromClient((player, entries) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;
            return Server.Research.reserveItemsForResearch(entries);
        });

        removeResearchPacket.fromClient((player, entries) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;
            return Server.Research.releaseItemsFromResearch(entries);
        });
    })
    .onLoad((model) => {
        const modelInfo = getAllInstanceInfo(model);
        const CurrencyService = Server.Currency;

        modelInfo.FurnaceProcessed = (_, raw, droplet) => {
            let delta = new OnoeNum(0);
            for (const [currency, amount] of raw.amountPerCurrency) {
                const details = CURRENCY_DETAILS[currency];
                if (details === undefined) throw `Unknown currency ${currency}`;
                switch (details.page) {
                    case CURRENCY_CATEGORIES.Main:
                        delta = delta.add(amount);
                        break;
                    case CURRENCY_CATEGORIES.Misc:
                        delta = delta.add(amount.pow(0.5).log(10) ?? 0);
                        break;
                }
            }
            const [bonusAdd, bonusMul] = Server.Research.getDifficultyPowerBonus();
            if (bonusAdd.moreThan(0)) {
                delta = delta.add(bonusAdd);
            }
            if (bonusMul.moreThan(1)) {
                delta = delta.mul(bonusMul);
            }
            const multiplier = Server.Research.calculateResearchMultiplier();
            if (multiplier.moreEquals(1)) {
                delta = delta.mul(multiplier);
            }
            const gain = new Map<Currency, OnoeNum>([["Difficulty Power", delta]]);
            CurrencyService.incrementAll(gain);
            Packets.dropletBurnt.toAllClients(droplet.Name, gain);
            Server.Research.updateUnlockedDifficulties();
        };
    })
    .onClientLoad((model, item, player) => {
        const folder = new Instance("Folder");
        folder.Name = `ResearchBoard-${model.Name}`;
        folder.Parent = player?.FindFirstChild("PlayerGui") ?? StarterGui;
        const root = createRoot(folder);

        const selectPart = model.WaitForChild("DifficultySelect") as BasePart;
        const descriptionPart = model.WaitForChild("DifficultyDescription") as BasePart;
        const imagePart = model.WaitForChild("DifficultyImage") as BasePart;
        const namePart = model.WaitForChild("DifficultyName") as BasePart;
        const orbPart = model.WaitForChild("Orb") as OrbPart;
        const vortex = model.WaitForChild("Vortex") as Part;
        root.render(
            <DifficultyResearcherGui
                selectPart={selectPart}
                descriptionPart={descriptionPart}
                imagePart={imagePart}
                namePart={namePart}
                orbPart={orbPart}
                vortexPart={vortex}
            />,
        );

        const connection = difficultyPacket.observe((id) => {
            const difficulty = id !== undefined ? Difficulty.get(id) : undefined;
            if (difficulty === undefined) return;
            const color = difficulty.color;
            if (color === undefined) return;

            descriptionPart.Color = color.Lerp(Color3.fromRGB(0, 0, 0), 0.8);
            imagePart.Color = color;
            namePart.Color = color.Lerp(Color3.fromRGB(0, 0, 0), 0.5);
        });

        model.Destroying.Once(() => {
            root.unmount();
            folder.Destroy();
            connection.Disconnect();
        });
    });
