import { getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { packet, property } from "@rbxts/fletchette";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
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
import { getDifficultyRewards, type DifficultyRewardDefinition } from "shared/item/DifficultyRewards";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Furnace from "shared/item/traits/Furnace";
import Generator from "shared/item/traits/generator/Generator";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import Packets from "shared/Packets";

const difficultyPacket = property<string | undefined>();
const setDifficultyPacket = packet<(difficultyId: string) => boolean>();
const addResearchPacket = packet<(itemId: string, amount: number) => boolean>();
const removeResearchPacket = packet<(itemId: string, amount: number) => boolean>();

type ItemQuantityEntry = { item: Item; amount: number };

function isResearchEligible(item: Item) {
    if (item.isA("Unique")) return false;
    if (item.isA("Gear")) return false;
    if (item.isA("Shop")) return false;
    if (item.id === "DifficultyResearcher") return false; // Self-reference
    const difficulty = item.difficulty;
    if (difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation) return false;
    return true;
}

function collectUniqueDifficulties() {
    const unique = new Set<string>();
    const sorted = new Array<Difficulty>();
    for (const item of Server.Items.sortedItems) {
        const difficulty = item.difficulty;
        if (difficulty.class === -99 || difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation)
            continue;
        if (TierDifficulty.TIERS.has(difficulty)) continue;
        if (unique.has(difficulty.id)) continue;
        unique.add(difficulty.id);
        sorted.push(difficulty);
    }
    sorted.sort((a, b) => (a.layoutRating ?? 0) < (b.layoutRating ?? 0));
    return sorted;
}

function getDifficultyRequirement(index: number) {
    if (index <= 0) {
        return new OnoeNum(1);
    }

    if (index % 2 === 1) {
        return OnoeNum.fromSerika(64, index - 1);
    }

    return OnoeNum.fromSerika(1, index + 1);
}

function buildDifficultyRequirements(difficulties: Difficulty[]) {
    const requirements = new Map<string, OnoeNum>();
    difficulties.forEach((difficulty, index) => {
        requirements.set(difficulty.id, getDifficultyRequirement(index));
    });
    return requirements;
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
}

function DifficultyCarousel({
    difficultyList,
    selectPart,
    requirements,
    playerDifficultyPower,
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
                const isUnlocked = requirement === undefined || playerDifficultyPower.moreEquals(requirement);
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
}

function DifficultySelectionSurface({
    activePage,
    setActivePage,
    difficultyList,
    selectPart,
    difficultyRequirements,
    playerDifficultyPower,
    nextUnlockRequirement,
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
}

function AvailableEntryRow({
    item,
    amount,
    onAbsorb,
}: ItemQuantityEntry & { onAbsorb: (itemId: string, amount: number) => void }) {
    const color = item.difficulty.color ?? Color3.fromRGB(60, 60, 110);
    const backgroundColor = new Color3(
        math.clamp(color.R, 0.1, 0.9),
        math.clamp(color.G, 0.1, 0.9),
        math.clamp(color.B, 0.1, 0.9),
    );
    return (
        <imagelabel
            key={`inventory-${item.id}`}
            BackgroundColor3={backgroundColor}
            BackgroundTransparency={0.2}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={3}
            Image={getAsset("assets/Grid.png")}
            ImageColor3={Color3.fromRGB(126, 126, 126)}
            ImageTransparency={0.6}
            ScaleType={Enum.ScaleType.Tile}
            Size={new UDim2(1, 0, 0, 36)}
            Visible={amount > 0}
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
                Size={new UDim2(0.5, 0, 1, 0)}
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
}: ItemQuantityEntry & { onRelease: (itemId: string, amount: number) => void }) {
    const color = item.difficulty.color?.Lerp(Color3.fromRGB(0, 0, 0), 0.4) ?? Color3.fromRGB(50, 40, 90);
    const backgroundColor = new Color3(
        math.clamp(color.R, 0.1, 0.9),
        math.clamp(color.G, 0.1, 0.9),
        math.clamp(color.B, 0.1, 0.9),
    );
    return (
        <imagelabel
            key={`research-${item.id}`}
            BackgroundColor3={backgroundColor}
            BackgroundTransparency={0.2}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={3}
            Image={getAsset("assets/Grid.png")}
            ImageColor3={Color3.fromRGB(126, 126, 126)}
            ImageTransparency={0.6}
            ScaleType={Enum.ScaleType.Tile}
            Size={new UDim2(1, 0, 0, 36)}
            Visible={amount > 0}
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
                Size={new UDim2(0.5, 0, 1, 0)}
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
}: ResearchInfoProps) {
    const availableCount = useMemo(() => {
        let count = 0;
        for (const entry of availableEntries) {
            count += entry.amount;
        }
        return count;
    }, [availableEntries]);

    const handleReleaseAll = useCallback(() => {
        for (const entry of researchEntries) {
            if (entry.amount > 0) {
                onRelease(entry.item.id, entry.amount);
            }
        }
    }, [researchEntries, onRelease]);

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
                Size={new UDim2(1, 0, 0, 28)}
                Text="Feed spare items to amplify difficulty power. Release them anytime."
                TextColor3={Color3.fromRGB(180, 180, 220)}
                TextStrokeTransparency={0}
                TextScaled={true}
                TextWrapped={true}
            />

            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Size={new UDim2(1, 0, 0, 24)}
                Text={`Current Multiplier: x${OnoeNum.toString(researchMultiplier)}`}
                TextColor3={Color3.fromRGB(220, 220, 255)}
                TextScaled={true}
                TextStrokeTransparency={0}
            />

            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
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
                    Size={new UDim2(1, 0, 0, 28)}
                    Text="No available items to research."
                    TextColor3={Color3.fromRGB(200, 200, 200)}
                    TextStrokeTransparency={0}
                    TextScaled={true}
                />
            ) : (
                <Fragment />
            )}
            {availableEntries.map((entry) => (
                <AvailableEntryRow
                    key={`inventory-${entry.item.id}`}
                    item={entry.item}
                    amount={entry.amount}
                    onAbsorb={onAbsorb}
                />
            ))}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
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
                    Size={new UDim2(1, 0, 0, 28)}
                    Text="No active research."
                    TextColor3={Color3.fromRGB(200, 200, 200)}
                    TextStrokeTransparency={0}
                    TextScaled={true}
                />
            ) : (
                <Fragment />
            )}
            {researchEntries.map((entry) => (
                <ActiveResearchRow
                    key={`research-${entry.item.id}`}
                    item={entry.item}
                    amount={entry.amount}
                    onRelease={onRelease}
                />
            ))}
            {totalResearchCount > 0 ? (
                <textbutton
                    BackgroundColor3={Color3.fromRGB(120, 60, 120)}
                    BackgroundTransparency={0.2}
                    BorderColor3={Color3.fromRGB(41, 41, 41)}
                    BorderSizePixel={3}
                    FontFace={RobotoMonoBold}
                    Size={new UDim2(1, 0, 0, 40)}
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

function computeRewardCost(reward: DifficultyRewardDefinition, playerDifficultyPower: OnoeNum) {
    if (reward.cost.kind === "percentageOfDifficultyPower") {
        let cost = playerDifficultyPower.mul(new OnoeNum(reward.cost.percentage));
        if (reward.cost.minimum !== undefined) {
            const minimum = new OnoeNum(reward.cost.minimum);
            if (cost.lessThan(minimum)) {
                cost = minimum;
            }
        }
        return cost;
    }
    return new OnoeNum(0);
}

function formatDurationShort(seconds: number) {
    if (seconds <= 0) return "0s";
    const rounded = math.floor(seconds);
    const minutes = math.floor(rounded / 60);
    const remainder = rounded % 60;
    if (minutes > 0) {
        return `${minutes}m ${remainder}s`;
    }
    return `${remainder}s`;
}

interface DifficultyRewardCardProps {
    layoutOrder: number;
    reward: DifficultyRewardDefinition;
    playerDifficultyPower: OnoeNum;
    cooldowns: Map<string, number>;
    now: number;
    revenuePerSecond: Map<Currency, BaseOnoeNum>;
    onClaim: (rewardId: string) => void;
}

function DifficultyRewardCard({
    layoutOrder,
    reward,
    playerDifficultyPower,
    cooldowns,
    now,
    revenuePerSecond,
    onClaim,
}: DifficultyRewardCardProps) {
    const cost = useMemo(() => computeRewardCost(reward, playerDifficultyPower), [reward, playerDifficultyPower]);
    const costText = useMemo(() => OnoeNum.toString(cost), [cost]);

    const cooldownExpiresAt = cooldowns.get(reward.id);
    const secondsRemaining = cooldownExpiresAt !== undefined ? math.max(cooldownExpiresAt - now, 0) : 0;
    const isCoolingDown = secondsRemaining > 0;
    const isAffordable = !playerDifficultyPower.lessThan(cost);
    const buttonDisabled = isCoolingDown || !isAffordable;

    const payoutText = useMemo(() => {
        switch (reward.effect.kind) {
            case "candyOfflineRevenue": {
                const payout = new Map<Currency, OnoeNum>();
                for (const [currency, amount] of revenuePerSecond) {
                    if (amount === undefined) continue;
                    const perSecond = new OnoeNum(amount);
                    const total = perSecond.mul(reward.effect.revenueSeconds);
                    if (total.lessEquals(0)) continue;
                    payout.set(currency, total);
                }
                if (payout.size() === 0) {
                    return `Est. payout (${reward.effect.revenueSeconds}s): <font color="#FF8BAA">No revenue data yet</font>.`;
                }
                const formatted = CurrencyBundle.currenciesToString(payout, true);
                return `Est. payout (${reward.effect.revenueSeconds}s): ${formatted}`;
            }
            case "walkSpeedBuff": {
                const durationText = formatDurationShort(reward.effect.durationSeconds);
                return `Effect: +${reward.effect.amount} WalkSpeed for ${durationText}.`;
            }
        }
    }, [revenuePerSecond, reward]);

    const statusColor = isCoolingDown
        ? Color3.fromRGB(255, 139, 170)
        : isAffordable
          ? Color3.fromRGB(165, 255, 181)
          : Color3.fromRGB(255, 200, 150);

    const statusText = isCoolingDown
        ? `Cooldown: ${formatDurationShort(secondsRemaining)}`
        : isAffordable
          ? "Ready to claim"
          : "Not enough Difficulty Power";

    const buttonText = isCoolingDown ? `Cooldown: ${formatDurationShort(secondsRemaining)}` : "Claim Reward";

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
                <imagelabel
                    BackgroundTransparency={1}
                    Size={new UDim2(0, 26, 0, 26)}
                    Image={reward.icon}
                    ScaleType={Enum.ScaleType.Fit}
                />
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
                Text={`Cost: <font color="#FFC0FF">${costText}</font> Difficulty Power`}
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
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 0, 0)}
                Text={statusText}
                TextColor3={statusColor}
                TextSize={20}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            />

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
    rewards: DifficultyRewardDefinition[];
    playerDifficultyPower: OnoeNum;
    cooldowns: Map<string, number>;
    now: number;
    revenuePerSecond: Map<Currency, BaseOnoeNum>;
    onClaim: (rewardId: string) => void;
}

function DifficultyRewardsSection({
    rewards,
    playerDifficultyPower,
    cooldowns,
    now,
    revenuePerSecond,
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
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 0, 0)}
                Text="Difficulty Rewards"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
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
                    now={now}
                    revenuePerSecond={revenuePerSecond}
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
}

function DescriptionPanel({ activePage, description, researchInfo, rewardInfo }: DescriptionPanelProps) {
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
                    now={rewardInfo.now}
                    revenuePerSecond={rewardInfo.revenuePerSecond}
                    onClaim={rewardInfo.onClaim}
                />
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
    revenueLabelRef: React.RefObject<TextLabel>;
}

function MultiplierBillboard({ orbPart, revenueLabelRef }: MultiplierBillboardProps) {
    return (
        <billboardgui
            Adornee={orbPart}
            AlwaysOnTop={true}
            LightInfluence={0}
            MaxDistance={100}
            Size={new UDim2(4, 0, 4, 0)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <textlabel
                ref={revenueLabelRef}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 1, 0)}
                Text=""
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke StrokeSizingMode={Enum.StrokeSizingMode.ScaledSize} Thickness={3} />
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
}: {
    selectPart: BasePart;
    descriptionPart: BasePart;
    imagePart: BasePart;
    namePart: BasePart;
    orbPart: BasePart;
}) {
    const revenueLabelRef = useRef<TextLabel>();
    const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | undefined>(undefined);
    const [activePage, setActivePage] = useState<"difficulties" | "research">("difficulties");
    const [balance, setBalance] = useState<Map<Currency, BaseOnoeNum>>(Packets.balance.get());
    const [inventory, setInventory] = useState<Map<string, number>>(Packets.inventory.get());
    const [researchingState, setResearchingState] = useState<Map<string, number>>(Packets.researching.get());
    const [researchMultiplier, setResearchMultiplier] = useState(Packets.researchMultiplier.get());
    const [rewardCooldowns, setRewardCooldowns] = useState<Map<string, number>>(
        Packets.difficultyRewardCooldowns.get(),
    );
    const [revenuePerSecond, setRevenuePerSecond] = useState<Map<Currency, BaseOnoeNum>>(
        Packets.revenue.get() ?? new Map(),
    );
    const [now, setNow] = useState(os.time());

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
        const rewardCooldownConnection = Packets.difficultyRewardCooldowns.observe((incoming) => {
            const mapped = incoming ?? new Map<string, number>();
            setRewardCooldowns(IS_EDIT ? table.clone(mapped) : mapped);
        });
        const revenueConnection = Packets.revenue.observe((incoming) => {
            const mapped = incoming ?? new Map<Currency, BaseOnoeNum>();
            setRevenuePerSecond(IS_EDIT ? table.clone(mapped) : mapped);
        });
        return () => {
            balanceConnection.Disconnect();
            inventoryConnection.Disconnect();
            researchingConnection.Disconnect();
            researchMultiplierConnection.Disconnect();
            rewardCooldownConnection.Disconnect();
            revenueConnection.Disconnect();
        };
    }, []);

    const difficultyList = useMemo(() => collectUniqueDifficulties(), []);

    const difficultyRequirements = useMemo(() => buildDifficultyRequirements(difficultyList), [difficultyList]);

    const playerDifficultyPower = useMemo(() => new OnoeNum(balance.get("Difficulty Power") ?? 0), [balance]);

    const nextUnlockRequirement = useMemo(() => {
        for (const difficulty of difficultyList) {
            const requirement = difficultyRequirements.get(difficulty.id);
            if (requirement !== undefined && playerDifficultyPower.lessThan(requirement)) {
                return requirement;
            }
        }
        return undefined;
    }, [difficultyList, difficultyRequirements, playerDifficultyPower]);

    const availableEntries = useMemo(() => {
        const entries = new Array<{ item: Item; amount: number }>();
        for (const item of Server.Items.sortedItems) {
            const itemId = item.id;
            if (!isResearchEligible(item)) continue;
            const total = inventory.get(itemId) ?? 0;
            const reserved = researchingState.get(itemId) ?? 0;
            const available = total - reserved;
            entries.push({ item, amount: available });
        }
        return entries;
    }, [inventory, researchingState]);

    const researchEntries = useMemo(() => {
        const entries = new Array<{ item: Item; amount: number }>();
        for (const item of Server.Items.sortedItems) {
            const itemId = item.id;
            const amount = researchingState.get(itemId) ?? 0;
            entries.push({ item, amount });
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
            const success = addResearchPacket.toServer(itemId, amount);
            playSound(success ? "Click.mp3" : "Error.mp3", selectPart);
        },
        [selectPart],
    );

    const handleRelease = useCallback(
        (itemId: string, amount: number) => {
            if (amount < 1) return;
            const success = removeResearchPacket.toServer(itemId, amount);
            playSound(success ? "Click.mp3" : "Error.mp3", selectPart);
        },
        [selectPart],
    );

    useEffect(() => {
        const label = revenueLabelRef.current;
        if (label !== undefined) {
            label.Text = `x${OnoeNum.toString(researchMultiplier)}`;
        }
    }, [researchMultiplier]);

    useEffect(() => {
        let alive = true;
        const update = () => {
            if (!alive) return;
            setNow(os.time());
            task.delay(1, update);
        };
        update();
        return () => {
            alive = false;
        };
    }, []);

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

        const currentRequirement = difficultyRequirements.get(currentDifficulty.id);
        if (currentRequirement !== undefined) {
            const requirementText = OnoeNum.toString(currentRequirement);
            const currentPowerText = OnoeNum.toString(playerDifficultyPower);
            const locked = playerDifficultyPower.lessThan(currentRequirement);
            const statusColor = locked ? "#FF8BAA" : "#A5FFB5";
            const statusText = locked ? `Locked until ${requirementText} Difficulty Power` : "Unlocked";
            const statusLine = `<font color="${statusColor}">${statusText} — Requires ${requirementText} Difficulty Power (You have ${currentPowerText}).</font>`;
            desc = `${desc}\n\n${statusLine}`;
        }

        return desc;
    }, [currentDifficulty, difficultyRequirements, playerDifficultyPower, researchMultiplier, totalResearchCount]);

    const difficultyRewards = useMemo(() => getDifficultyRewards(currentDifficulty), [currentDifficulty]);

    const handleClaimReward = useCallback(
        (rewardId: string) => {
            const success = Packets.claimDifficultyReward.toServer(rewardId);
            playSound(success ? "Click.mp3" : "Error.mp3", selectPart);
        },
        [selectPart],
    );

    const researchInfo = useMemo<ResearchInfoProps>(
        () => ({
            availableEntries,
            researchEntries,
            totalResearchCount,
            researchMultiplier,
            onAbsorb: handleAbsorb,
            onRelease: handleRelease,
        }),
        [availableEntries, researchEntries, totalResearchCount, researchMultiplier, handleAbsorb, handleRelease],
    );

    const rewardInfo = useMemo<DifficultyRewardsSectionProps>(
        () => ({
            rewards: difficultyRewards,
            playerDifficultyPower,
            cooldowns: rewardCooldowns,
            now,
            revenuePerSecond,
            onClaim: handleClaimReward,
        }),
        [difficultyRewards, playerDifficultyPower, rewardCooldowns, now, revenuePerSecond, handleClaimReward],
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
            <MultiplierBillboard orbPart={orbPart} revenueLabelRef={revenueLabelRef} />
            {portal}
        </Fragment>
    );
}

export = new Item(script.Name)
    .setName("Difficulty Researcher")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setDescription("Learn about the world.")
    .setPrice(new CurrencyBundle().set("Funds", 100), 1)
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
        const serverDifficultyList = collectUniqueDifficulties();
        const serverDifficultyRequirements = buildDifficultyRequirements(serverDifficultyList);

        setDifficultyPacket.fromClient((player, difficultyId) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;
            const difficulty = Difficulty.get(difficultyId);
            if (difficulty === undefined) return false;
            let requirement = serverDifficultyRequirements.get(difficulty.id);
            if (requirement === undefined) {
                const index = serverDifficultyList.findIndex((entry) => entry.id === difficulty.id);
                if (index === -1) return false;
                requirement = getDifficultyRequirement(index);
                serverDifficultyRequirements.set(difficulty.id, requirement);
            }
            if (requirement !== undefined) {
                const currentDifficultyPower = Server.Currency.get("Difficulty Power");
                if (currentDifficultyPower.lessThan(requirement)) return false;
            }
            difficultyPacket.set(difficulty.id);
            return true;
        });

        addResearchPacket.fromClient((player, itemId, amount) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;

            const sanitizedAmount = math.floor(math.clamp(amount, 1, 1e6));
            if (sanitizedAmount < 1) return false;

            const item = Server.Items.itemsPerId.get(itemId);
            if (item === undefined) return false;
            if (item.isA("Unique")) return false;

            return Server.Research.reserveItemsForResearch(itemId, sanitizedAmount);
        });

        removeResearchPacket.fromClient((player, itemId, amount) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;

            const sanitizedAmount = math.floor(math.clamp(amount, 1, 1e6));
            if (sanitizedAmount < 1) return false;

            if (!Server.Items.itemsPerId.has(itemId)) return false;

            return Server.Research.releaseItemsFromResearch(itemId, sanitizedAmount);
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
                        delta = delta.add(amount.mul(0.005).pow(0.5).log(10) ?? 0);
                        break;
                }
            }
            const multiplier = Server.Research.calculateResearchMultiplier();
            if (multiplier.moreEquals(1)) {
                delta = delta.mul(multiplier);
            }
            const gain = new Map<Currency, OnoeNum>([["Difficulty Power", delta]]);
            CurrencyService.incrementAll(gain);
            Packets.dropletBurnt.toAllClients(droplet.Name, gain);
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
        const orbPart = model.WaitForChild("Orb") as BasePart;
        root.render(
            <DifficultyResearcherGui
                selectPart={selectPart}
                descriptionPart={descriptionPart}
                imagePart={imagePart}
                namePart={namePart}
                orbPart={orbPart}
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
