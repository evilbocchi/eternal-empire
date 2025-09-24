import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { RobotoMono, RobotoSlabBold, RobotoSlabExtraBold, RobotoSlabMedium } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";

/**
 * About window component with game information and credits
 */
export default function AboutWindow({
    onClose,
}: {
    /** Close callback */
    onClose: () => void;
}) {
    const scrollFrameRef = useRef<ScrollingFrame>();
    const [hasAnimated, setHasAnimated] = useState(false);

    const contributors = new Set<string>();
    for (const item of Items.sortedItems) {
        if (item.creator !== undefined) contributors.add(item.creator);
    }

    // Entrance animation
    useEffect(() => {
        if (!hasAnimated && scrollFrameRef.current) {
            setHasAnimated(true);

            // Start the window below the screen
            scrollFrameRef.current.Position = new UDim2(0, 0, 1.5, 0);

            // Animate sliding up to final position
            const slideUpTween = TweenService.Create(
                scrollFrameRef.current,
                new TweenInfo(0.6, Enum.EasingStyle.Quart, Enum.EasingDirection.Out),
                { Position: new UDim2(0, 0, 0.5, 0) },
            );
            slideUpTween.Play();
        }
    }, [hasAnimated]);

    const handleClose = useCallback(() => {
        playSound("MenuClose.mp3");

        // Animate sliding down before closing
        if (scrollFrameRef.current) {
            const slideDownTween = TweenService.Create(
                scrollFrameRef.current,
                new TweenInfo(0.4, Enum.EasingStyle.Quart, Enum.EasingDirection.In),
                { Position: new UDim2(0, 0, 1.5, 0) },
            );

            slideDownTween.Play();
            slideDownTween.Completed.Connect(() => {
                onClose();
            });
        } else {
            // Fallback if ref is not available
            onClose();
        }
    }, [onClose]);

    return (
        <scrollingframe
            ref={scrollFrameRef}
            AnchorPoint={new Vector2(0, 0.5)}
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            BackgroundColor3={Color3.fromRGB(25, 25, 35)}
            BackgroundTransparency={0.6}
            BorderSizePixel={0}
            CanvasSize={new UDim2(0, 0, 0, 0)}
            Position={new UDim2(0, 0, 0.5, 0)}
            Size={new UDim2(1, 0, 1, -10)}
            ScrollBarThickness={8}
            ScrollBarImageColor3={Color3.fromRGB(85, 170, 255)}
            ZIndex={10}
        >
            {/* Background styling */}
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 45)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                    ])
                }
                Rotation={135}
            />

            {/* Content Layout */}
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                ItemLineAlignment={Enum.ItemLineAlignment.Center}
                Padding={new UDim(0, 50)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Close Button */}
            <imagebutton
                BackgroundTransparency={1}
                Image={getAsset("assets/NPCNotification.png")}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(1, 0, 0, 35)}
                Event={{ Activated: handleClose }}
            />

            {/* Logo */}
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Image={getAsset("assets/LogoSmall.png")}
                Position={new UDim2(0.15, 0, 0, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(1, 0, 0.25, 0)}
            />
            <textlabel
                Active={true}
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Size={new UDim2(0.65, 0, 0, 0)}
                Text="Build your money-making empire. Uncover the world of Obbysia."
                TextColor3={Color3.fromRGB(199, 199, 199)}
                TextSize={20}
            >
                <uipadding PaddingTop={new UDim(0, -25)} />
            </textlabel>

            {/* Game Description */}
            <textlabel
                Active={true}
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Size={new UDim2(0.65, 0, 0, 0)}
                Text="JME is an incremental-style tycoon building game designed off the EToH Joke Towers Difficulty Chart. Containing various MMO, RPG and Clicker aspects, how will you rise to the top of this capitalistic world?"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>

            {/* Credits Section Header */}
            <textlabel
                Active={true}
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabExtraBold}
                Size={new UDim2(0.65, 0, 0, 0)}
                Text="Credits"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={60}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>

            {/* Separator */}
            <frame
                BackgroundColor3={Color3.fromRGB(85, 170, 255)}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Size={new UDim2(0.5, 0, 0, 2)}
            >
                <uicorner CornerRadius={new UDim(0, 1)} />
            </frame>

            {/* Creator Section */}
            <frame Active={true} BackgroundTransparency={1} Size={new UDim2(0.7, 0, 0, 75)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    ItemLineAlignment={Enum.ItemLineAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />

                <frame BackgroundTransparency={1} Size={new UDim2(0.5, 0, 1, 0)}>
                    <textlabel
                        Active={true}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={2}
                        Size={new UDim2(1, 0, 0.35, 0)}
                        Text="Creator & Developer of JJT Money Empire"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={50}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2.5} />
                    </textlabel>
                    <textlabel
                        Active={true}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Size={new UDim2(1, 0, 0.645, 0)}
                        Text="migeru_tan"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={50}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2.5} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 130, 71)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 59, 59)),
                                ])
                            }
                            Rotation={90}
                        />
                    </textlabel>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        ItemLineAlignment={Enum.ItemLineAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                </frame>
            </frame>

            {/* Team Section */}
            <frame Active={true} BackgroundTransparency={1} Size={new UDim2(0.7, 0, 0, 75)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    ItemLineAlignment={Enum.ItemLineAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />

                {/* Music Composer */}
                <frame BackgroundTransparency={1} Size={new UDim2(0.5, 0, 1, 0)}>
                    <textlabel
                        Active={true}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={2}
                        Size={new UDim2(1, 0, 0.35, 0)}
                        Text="Music Composer"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={50}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2.5} />
                    </textlabel>
                    <textlabel
                        Active={true}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Size={new UDim2(1, 0, 0.645, 0)}
                        Text="raika"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={50}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2.5} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(245, 186, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(209, 97, 255)),
                                ])
                            }
                            Rotation={90}
                        />
                    </textlabel>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        ItemLineAlignment={Enum.ItemLineAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                </frame>
            </frame>

            {/* Testers */}
            <frame Active={true} BackgroundTransparency={1} Size={new UDim2(0.7, 0, 0, 55)}>
                <textlabel
                    Active={true}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(1, 0, 0.645, 0)}
                    Text="CREATIVITEEE, KillerFish_SD, Bernario, simple13579"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={50}
                    TextWrapped={true}
                >
                    <uistroke Thickness={2.5} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 248, 147)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 0)),
                            ])
                        }
                        Rotation={90}
                    />
                </textlabel>
                <textlabel
                    Active={true}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    LayoutOrder={2}
                    Size={new UDim2(1, 0, 0.35, 0)}
                    Text="Testers"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={50}
                    TextWrapped={true}
                >
                    <uistroke Thickness={2.5} />
                </textlabel>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    ItemLineAlignment={Enum.ItemLineAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
            </frame>

            {/* Contributors */}
            <frame Active={true} BackgroundTransparency={1} Size={new UDim2(0.7, 0, 0, 55)}>
                <textlabel
                    Active={true}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(1, 0, 0.645, 0)}
                    Text={[...contributors].sort((a, b) => a < b).join(", ")}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={50}
                    TextWrapped={true}
                >
                    <uistroke Thickness={2.5} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 116, 169)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 39, 136)),
                            ])
                        }
                        Rotation={90}
                    />
                </textlabel>
                <textlabel
                    Active={true}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(1, 0, 0.35, 0)}
                    Text="Contributors"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={50}
                    TextWrapped={true}
                >
                    <uistroke Thickness={2.5} />
                </textlabel>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    ItemLineAlignment={Enum.ItemLineAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
            </frame>

            {/* Thank You Messages */}
            <textlabel
                Active={true}
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(0.65, 0, 0, 0)}
                Text="To each and every supporter, my warmest thank you!"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={40}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>

            <textlabel
                Active={true}
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Size={new UDim2(0.65, 0, 0, 0)}
                Text="That includes you. <3"
                TextColor3={Color3.fromRGB(162, 162, 162)}
                TextSize={30}
                TextWrapped={true}
            >
                <uistroke Thickness={2.5} />
            </textlabel>

            {/* Padding */}
            <uipadding PaddingBottom={new UDim(0, 50)} />
        </scrollingframe>
    );
}
