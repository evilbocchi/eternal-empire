import Signal from "@antivivi/lemon-signal";
import React, { useEffect, useMemo, useRef } from "@rbxts/react";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { RobotoSlab, RobotoSlabBold, RobotoSlabExtraBold, RobotoSlabMedium } from "client/GameFonts";
import getDifficultyDisplayColors from "client/components/tooltip/getDifficultyDisplayColors";
import Packets from "shared/Packets";
import { getAsset } from "shared/asset/AssetMap";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Items from "shared/items/Items";

// Precompute item metadata for efficient tooltip rendering
export const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 16, "Bold"));
}

/**
 * Global tooltip manager with static methods for showing/hiding tooltips
 */
export namespace TooltipManager {
    let tooltipData: TooltipData | undefined;
    let isVisible = false;
    export const tooltipUpdated = new Signal<(visible: boolean, data?: TooltipData) => void>();

    export function showTooltip(data: TooltipData) {
        tooltipData = data;
        isVisible = true;
        tooltipUpdated.fire(isVisible, tooltipData);
    }

    export function hideTooltip() {
        isVisible = false;
        tooltipUpdated.fire(isVisible, tooltipData);
    }
}

/**
 * Tooltip window component that displays formatted tooltip content
 */
export default function TooltipWindow() {
    const frameRef = useRef<Frame>();
    const messageRef = useRef<TextLabel>();
    const strokeRef = useRef<UIStroke>();
    const itemSlotRef = useRef<ImageLabel>();
    const [data, setData] = React.useState<TooltipData | undefined>(undefined);
    const [visible, setVisible] = React.useState(false);

    // Subscribe to tooltip manager updates
    useEffect(() => {
        const tooltipUpdatedConnection = TooltipManager.tooltipUpdated.connect((visible, data) => {
            setVisible(visible);
            setData(data);
        });

        const boostChangedConnection = Packets.boostChanged.fromServer((value) => {
            for (const [itemId, boost] of value) {
                const item = Items.getItem(itemId);
                if (item === undefined) continue;
                const metadata = METADATA_PER_ITEM.get(item);
                if (metadata === undefined) continue;
                metadata.spacing();
                metadata.formula(undefined, boost);
            }
        });

        const unlockedAreasConnection = Packets.unlockedAreas.observe((areas) => {
            if (areas.has("SlamoVillage")) {
                for (const [_, metadata] of METADATA_PER_ITEM) {
                    metadata.spacing();
                    metadata.placeableAreas();
                    metadata.resetLayer();
                }
            }
        });

        const levelConnection = Packets.level.observe((level) => {
            for (const [_, metadata] of METADATA_PER_ITEM) {
                metadata.levelReq(level);
            }
        });

        return () => {
            tooltipUpdatedConnection.disconnect();
            boostChangedConnection.Disconnect();
            unlockedAreasConnection.disconnect();
            levelConnection.disconnect();
        };
    }, []);

    // Animate show/hide
    useEffect(() => {
        if (!frameRef.current || !strokeRef.current) return;

        if (itemSlotRef.current) {
            // No animation for item slots
            frameRef.current.Visible = visible;
            frameRef.current.Transparency = 0;
            strokeRef.current.Transparency = 1;
            return;
        }

        if (visible) {
            frameRef.current.Visible = true;

            const tweenInfo = new TweenInfo(0.2);
            TweenService.Create(frameRef.current, tweenInfo, { BackgroundTransparency: 0.2 }).Play();
            TweenService.Create(strokeRef.current, tweenInfo, { Transparency: 0.2 }).Play();
            if (messageRef.current)
                TweenService.Create(messageRef.current, tweenInfo, {
                    TextTransparency: 0,
                    TextStrokeTransparency: 0,
                }).Play();
        } else {
            const tweenInfo = new TweenInfo(0.2, Enum.EasingStyle.Linear, Enum.EasingDirection.In);

            const tween = TweenService.Create(frameRef.current, tweenInfo, { BackgroundTransparency: 1 });
            TweenService.Create(strokeRef.current, tweenInfo, { Transparency: 1 }).Play();
            if (messageRef.current)
                TweenService.Create(messageRef.current, tweenInfo, {
                    TextTransparency: 1,
                    TextStrokeTransparency: 1,
                }).Play();

            const connection = tween.Completed.Once(() => {
                if (frameRef.current) {
                    frameRef.current.Visible = false;
                }
            });
            tween.Play();
            return () => connection.Disconnect();
        }
    }, [visible]);

    // Update position - decouple from React render cycle
    useEffect(() => {
        if (!visible || !frameRef.current) return;

        const frame = frameRef.current;

        const connection = RunService.Heartbeat.Connect(() => {
            const canvasSize = Workspace.CurrentCamera?.ViewportSize;
            const mouse = Environment.UserInput.GetMouseLocation();

            if (canvasSize !== undefined) {
                // Directly update DOM properties without triggering React reconciliation
                frame.AnchorPoint = new Vector2(canvasSize.X - mouse.X < 200 ? 1 : 0, mouse.Y < 200 ? 0 : 1);
                frame.Position = UDim2.fromOffset(mouse.X, mouse.Y);
            }
        });

        return () => connection.Disconnect();
    }, [visible]);

    // Memoize expensive tooltip content computation
    const tooltipContent = useMemo(() => {
        if (!data?.item) return undefined;

        const item = data.item;
        const difficulty = item.difficulty;

        const itemMetadata = METADATA_PER_ITEM.get(item);
        if (!itemMetadata) return undefined;

        const description = itemMetadata.formatItemDescription(
            data.uuid,
            true,
            Color3.fromRGB(195, 195, 195),
            18,
            "Medium",
        );

        // Pre-calculate colors
        const { background: backgroundColor, text: textColor } = getDifficultyDisplayColors(difficulty);

        return { item, difficulty, description, backgroundColor, textColor };
    }, [data?.item, data?.uuid, METADATA_PER_ITEM]);

    const renderItemSlot = () => {
        if (!tooltipContent) return undefined;

        const { item, difficulty, description, backgroundColor, textColor } = tooltipContent;

        return (
            <imagelabel
                key="ItemSlot"
                ref={itemSlotRef}
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundColor3={backgroundColor}
                BackgroundTransparency={0.2}
                BorderColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={3}
                Image={getAsset("assets/Grid.png")}
                ImageColor3={Color3.fromRGB(126, 126, 126)}
                ImageTransparency={0.6}
                LayoutOrder={-2}
                ScaleType={Enum.ScaleType.Tile}
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
                <uilistlayout
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Difficulty Frame */}
                <frame
                    key="Difficulty"
                    AnchorPoint={new Vector2(0, 1)}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    LayoutOrder={1}
                    Position={new UDim2(0, 110, 1, -15)}
                    Size={new UDim2(0, 0, 0, 20)}
                >
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        Padding={new UDim(0, 10)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                    <imagelabel
                        AnchorPoint={new Vector2(1, 0.5)}
                        BackgroundColor3={difficulty.color ?? Color3.fromRGB(255, 255, 255)}
                        Image={`rbxassetid://${difficulty.image}`}
                        LayoutOrder={-1}
                        Position={new UDim2(1, -4, 0.5, 0)}
                        Size={new UDim2(0, 20, 0, 20)}
                    >
                        <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                    </imagelabel>
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabMedium}
                        Position={new UDim2(0, 110, 0, 40)}
                        Size={new UDim2(0, 0, 1, 0)}
                        Text={tostring(difficulty.name)}
                        TextColor3={textColor}
                        TextSize={20}
                    >
                        <uistroke Thickness={2} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.478, Color3.fromRGB(225, 225, 225)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(148, 148, 148)),
                                ])
                            }
                            Rotation={90}
                        />
                    </textlabel>
                </frame>

                {/* Title Label */}
                <textlabel
                    key="TitleLabel"
                    AutomaticSize={Enum.AutomaticSize.XY}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabExtraBold}
                    Position={new UDim2(0, 110, 0, 15)}
                    Text={item.name}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={26}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={2} />
                    <uisizeconstraint MaxSize={new Vector2(400, math.huge)} />
                </textlabel>

                {/* Item Description */}
                <textlabel
                    key="MessageLabel"
                    Active={true}
                    AutomaticSize={Enum.AutomaticSize.XY}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    LayoutOrder={5}
                    RichText={true}
                    Text={description}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={19}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uisizeconstraint MaxSize={new Vector2(400, math.huge)} />
                    <uipadding PaddingBottom={new UDim(0, 5)} PaddingTop={new UDim(0, 15)} />
                </textlabel>

                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 10)}
                />
            </imagelabel>
        );
    };

    return (
        <frame
            ref={frameRef}
            key="TooltipWindow"
            AutomaticSize={Enum.AutomaticSize.XY}
            BackgroundColor3={Color3.fromRGB(50, 45, 52)}
            BackgroundTransparency={1}
            BorderSizePixel={0}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Visible={false}
            ZIndex={5}
        >
            {/* Simple message label for text-only tooltips */}
            {data && !data.item && (
                <textlabel
                    key="MessageLabel"
                    ref={messageRef}
                    AutomaticSize={Enum.AutomaticSize.XY}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    RichText={true}
                    Text={data.message || ""}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={19}
                    TextStrokeTransparency={1}
                    TextTransparency={1}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uisizeconstraint MaxSize={new Vector2(400, math.huge)} />
                    <uipadding
                        PaddingBottom={new UDim(0, 5)}
                        PaddingLeft={new UDim(0, 5)}
                        PaddingRight={new UDim(0, 5)}
                        PaddingTop={new UDim(0, 5)}
                    />
                </textlabel>
            )}

            {/* Item slot for item tooltips */}
            {renderItemSlot()}

            <uistroke
                ref={strokeRef}
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={Color3.fromRGB(28, 25, 29)}
                Transparency={1}
            />
            <uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder} />
        </frame>
    );
}
