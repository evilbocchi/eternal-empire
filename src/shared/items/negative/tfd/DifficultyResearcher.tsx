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
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import Generator from "shared/item/traits/generator/Generator";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import Packets from "shared/Packets";

const difficultyPacket = property<string | undefined>();
const researchMultiplierPacket = property<BaseOnoeNum>(new OnoeNum(1));
const setDifficultyPacket = packet<(difficultyId: string) => boolean>();
const addResearchPacket = packet<(itemId: string, amount: number) => boolean>();
const removeResearchPacket = packet<(itemId: string, amount: number) => boolean>();

type ItemQuantityEntry = { item: Item; amount: number };

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
}

function DifficultyCarousel({ difficultyList, selectPart }: DifficultyCarouselProps) {
    return (
        <scrollingframe
            LayoutOrder={1}
            Active={true}
            AutomaticCanvasSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            CanvasSize={new UDim2(0, 0, 1, -40)}
            HorizontalScrollBarInset={Enum.ScrollBarInset.ScrollBar}
            ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
            ScrollingDirection={Enum.ScrollingDirection.X}
            Size={new UDim2(1, 0, 1, -40)}
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
            {difficultyList.map((difficulty) => (
                <imagebutton
                    key={difficulty.id}
                    Active={true}
                    AutoButtonColor={false}
                    BackgroundColor3={difficulty.color}
                    BorderColor3={difficulty.color?.Lerp(Color3.fromRGB(0, 0, 0), 0.8)}
                    BorderSizePixel={2}
                    Image={difficulty.image}
                    LayoutOrder={difficulty.layoutRating}
                    Size={new UDim2(1, -8, 1, -8)}
                    Event={{
                        Activated: () => {
                            const success = setDifficultyPacket.toServer(difficulty.id);
                            playSound(success ? "Click.mp3" : "Error.mp3", selectPart);
                        },
                        MouseEnter: (rbx) => {
                            TweenService.Create(rbx, new TweenInfo(0.1), {
                                ImageTransparency: 0.5,
                            }).Play();
                        },
                        MouseLeave: (rbx) => {
                            TweenService.Create(rbx, new TweenInfo(0.1), {
                                ImageTransparency: 0,
                            }).Play();
                        },
                    }}
                >
                    <uiaspectratioconstraint />
                    <uicorner CornerRadius={new UDim(0, 6)} />
                </imagebutton>
            ))}
        </scrollingframe>
    );
}

interface DifficultySelectionSurfaceProps {
    activePage: "difficulties" | "research";
    setActivePage: (page: "difficulties" | "research") => void;
    difficultyList: Difficulty[];
    selectPart: BasePart;
}

function DifficultySelectionSurface({
    activePage,
    setActivePage,
    difficultyList,
    selectPart,
}: DifficultySelectionSurfaceProps) {
    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <uipadding
                PaddingBottom={new UDim(0, 16)}
                PaddingLeft={new UDim(0, 16)}
                PaddingRight={new UDim(0, 16)}
                PaddingTop={new UDim(0, 16)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <TabSwitcher activePage={activePage} onChange={setActivePage} />
            <DifficultyCarousel difficultyList={difficultyList} selectPart={selectPart} />
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
                Text={`Available (${availableEntries.size()})`}
                TextColor3={Color3.fromRGB(210, 210, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
            </textlabel>
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
        </frame>
    );
}

interface DescriptionPanelProps {
    activePage: "difficulties" | "research";
    description: string;
    researchInfo: ResearchInfoProps;
}

function DescriptionPanel({ activePage, description, researchInfo }: DescriptionPanelProps) {
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
                <uistroke Thickness={3} />
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
    const [inventory, setInventory] = useState<Map<string, number>>(Packets.inventory.get());
    const [researchingState, setResearchingState] = useState<Map<string, number>>(Packets.researching.get());
    const [researchMultiplier, setResearchMultiplier] = useState(researchMultiplierPacket.get());

    useEffect(() => {
        const inventoryConnection = Packets.inventory.observe((incoming) => {
            setInventory(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const researchingConnection = Packets.researching.observe((incoming) => {
            setResearchingState(IS_EDIT ? table.clone(incoming) : incoming);
        });
        const researchMultiplierConnection = researchMultiplierPacket.observe((incoming) => {
            setResearchMultiplier(IS_EDIT ? table.clone(incoming) : incoming);
        });
        return () => {
            inventoryConnection.Disconnect();
            researchingConnection.Disconnect();
            researchMultiplierConnection.Disconnect();
        };
    }, []);

    const difficultyList = useMemo(() => {
        const unique = new Set<string>();
        const sorted = new Array<Difficulty>();
        for (const item of Server.Items.sortedItems) {
            const difficulty = item.difficulty;
            if (difficulty.class === -99 || difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation)
                continue;
            if (unique.has(difficulty.id)) continue;
            unique.add(difficulty.id);
            sorted.push(difficulty);
        }
        sorted.sort((a, b) => (a.layoutRating ?? 0) < (b.layoutRating ?? 0));
        return sorted;
    }, []);

    const availableEntries = useMemo(() => {
        const entries = new Array<{ item: Item; amount: number }>();
        for (const item of Server.Items.sortedItems) {
            const itemId = item.id;
            if (item.isA("Unique")) continue;
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
        if (currentDifficulty === Difficulty.TheFirstDifficulty) {
            desc = "(Use the rainbow vortex on the right to absorb items into the orb.)\n\n" + desc;
        }

        const multiplierText = OnoeNum.toString(researchMultiplier);
        if (totalResearchCount > 0) {
            desc = `${desc}\n\n<font color="#A5A5FF">Researching ${totalResearchCount} item${
                totalResearchCount === 1 ? "" : "s"
            } (${multiplierText})</font>`;
        } else {
            desc = `${desc}\n\n<font color="#A5A5FF">No items are being researched.</font>`;
        }

        return desc;
    }, [currentDifficulty, researchMultiplier, totalResearchCount]);

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
                <DescriptionPanel activePage={activePage} description={description} researchInfo={researchInfo} />
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
        setDifficultyPacket.fromClient((player, difficultyId) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;
            const difficulty = Difficulty.get(difficultyId);
            if (difficulty === undefined) return false;
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

            return Server.Item.reserveItemsForResearch(itemId, sanitizedAmount);
        });

        removeResearchPacket.fromClient((player, itemId, amount) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;

            const sanitizedAmount = math.floor(math.clamp(amount, 1, 1e6));
            if (sanitizedAmount < 1) return false;

            if (!Server.Items.itemsPerId.has(itemId)) return false;

            return Server.Item.releaseItemsFromResearch(itemId, sanitizedAmount);
        });
    })
    .onLoad((model, item) => {
        const modelInfo = getAllInstanceInfo(model);
        const CurrencyService = Server.Currency;
        let lastMultiplier = new OnoeNum(-1);

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
            const multiplier = Server.Item.calculateResearchMultiplier();
            if (!lastMultiplier.equals(multiplier)) {
                lastMultiplier = multiplier;
                researchMultiplierPacket.set(multiplier);
            }
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

            selectPart.Color = color.Lerp(Color3.fromRGB(0, 0, 0), 0.5);
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
