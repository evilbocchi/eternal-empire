/**
 * @fileoverview React tooltip window component for displaying formatted tooltips.
 * 
 * Renders tooltip content with smooth animations and supports both simple message
 * tooltips and rich item tooltips with metadata, difficulty indicators, and formatting.
 * Based on the actual TooltipWindow structure from Roblox Studio.
 */

import { buildRichText } from "@antivivi/vrldk";
import React, { useEffect, useMemo, useRef } from "@rbxts/react";
import { GuiService, RunService, TweenService, Workspace } from "@rbxts/services";
import Packets from "shared/Packets";
import { getAsset } from "shared/asset/AssetMap";
import { LOCAL_PLAYER } from "shared/constants";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Unique from "shared/item/traits/Unique";
import { RobotoSlab, RobotoSlabBold, RobotoSlabExtraBold, RobotoSlabMedium } from "shared/ui/GameFonts";
import { TooltipData } from "shared/ui/components/tooltip/TooltipProvider";

interface TooltipWindowProps {
    data?: TooltipData;
    visible: boolean;
    metadata: Map<Item, ItemMetadata>;
}

/**
 * Tooltip window component that displays formatted tooltip content
 */
export default function TooltipWindow({ data, visible, metadata }: TooltipWindowProps) {
    const frameRef = useRef<Frame>();
    const messageRef = useRef<TextLabel>();
    const strokeRef = useRef<UIStroke>();
    const itemSlotRef = useRef<ImageLabel>();

    // Animate show/hide
    useEffect(() => {
        if (!frameRef.current || !strokeRef.current) return;

        if (visible) {
            frameRef.current.Visible = true;

            const tweenInfo = new TweenInfo(0.2);
            TweenService.Create(frameRef.current, tweenInfo, { BackgroundTransparency: 0.2 }).Play();
            TweenService.Create(strokeRef.current, tweenInfo, { Transparency: 0.2 }).Play();
            if (messageRef.current)
                TweenService.Create(messageRef.current, tweenInfo, { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
        }
        else {
            const tweenInfo = new TweenInfo(0.2, Enum.EasingStyle.Linear, Enum.EasingDirection.In);

            const tween = TweenService.Create(frameRef.current, tweenInfo, { BackgroundTransparency: 1 });
            TweenService.Create(strokeRef.current, tweenInfo, { Transparency: 1 }).Play();
            if (messageRef.current)
                TweenService.Create(messageRef.current, tweenInfo, { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();

            const connection = tween.Completed.Once(() => {
                if (frameRef.current) {
                    frameRef.current.Visible = false;
                }
            });
            tween.Play();
            return () => connection.Disconnect();
        }
    }, [visible]);

    // Update position - only when tooltip is visible
    useEffect(() => {
        if (!visible) return;

        let frameId = 0;
        const connection = RunService.Heartbeat.Connect(() => {
            frameId++;
            // Throttle position updates to every 3rd frame for better performance
            if (frameId % 3 !== 0) return;

            if (!frameRef.current) return;

            const canvasSize = Workspace.CurrentCamera?.ViewportSize;
            const mouse = LOCAL_PLAYER.GetMouse();

            if (canvasSize !== undefined) {
                frameRef.current.AnchorPoint = new Vector2(canvasSize.X - mouse.X < 200 ? 1 : 0, mouse.Y < 200 ? 0 : 1);
                const [topLeftCorner] = GuiService.GetGuiInset();
                frameRef.current.Position = UDim2.fromOffset(mouse.X + topLeftCorner.X, mouse.Y + topLeftCorner.Y);
            }
        });
        return () => connection.Disconnect();
    }, [visible]);

    // Memoize expensive tooltip content computation
    const tooltipContent = useMemo(() => {
        if (!data?.item) return undefined;

        const item = data.item;
        const difficulty = item.difficulty;

        let description = item.tooltipDescription ?? item.description;

        // Use unique item description if this is a unique item
        if (data.uuid !== undefined) {
            const uniqueInstance = Packets.uniqueInstances.get()?.get(data.uuid);
            if (uniqueInstance !== undefined) {
                description = item.trait(Unique).formatWithPots(description, uniqueInstance);
            }
        }

        // Build rich text for item description
        const builder = buildRichText(
            undefined,
            item.format(description),
            Color3.fromRGB(195, 195, 195),
            18,
            "Medium"
        );

        const itemMetadata = metadata.get(item);
        if (itemMetadata) {
            builder.appendAll(itemMetadata.builder);
        }

        // Pre-calculate colors
        let color = difficulty.color ?? new Color3();
        color = color ? new Color3(math.clamp(color.R, 0.1, 0.9), math.clamp(color.G, 0.1, 0.9), math.clamp(color.B, 0.1, 0.9)) : new Color3();
        const textColor = difficulty.color?.Lerp(new Color3(1, 1, 1), 0.5) ?? Color3.fromRGB(255, 255, 255);

        return {
            item,
            difficulty,
            richText: builder.toString(),
            backgroundColor: color,
            textColor,
        };
    }, [data?.item, data?.uuid, metadata]);

    const renderItemSlot = () => {
        if (!tooltipContent) return undefined;

        const { item, difficulty, richText, backgroundColor, textColor } = tooltipContent;

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
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(236, 236, 236)),
                            new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                            new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(220, 220, 220))
                        ])}
                        Rotation={35}
                    />
                </uistroke>
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(39, 39, 39)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(58, 58, 58))
                    ])}
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
                            Color={new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.478, Color3.fromRGB(225, 225, 225)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(148, 148, 148))
                            ])}
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
                    Text={richText}
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