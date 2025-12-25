import Difficulty from "@rbxts/ejt";
import React, { Fragment, JSX, useEffect, useState } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { toNumeral } from "@rbxts/roman-numerals";
import { TweenService } from "@rbxts/services";
import useProperty from "client/hooks/useProperty";
import { Server } from "shared/api/APIExpose";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoSlabBold, RobotoSlabExtraBold, RobotoSlabHeavy, RobotoSlabMedium } from "shared/asset/GameFonts";
import { Challenge, CHALLENGE_PER_ID } from "shared/Challenge";
import Item from "shared/item/Item";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

/**
 * Individual challenge option component
 */
function ChallengeOption({ challenge, currentLevel }: { challenge: Challenge; currentLevel: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [confirmationState, setConfirmationState] = useState<{
        showConfirmation: boolean;
        lastClickTime: number;
    }>({ showConfirmation: false, lastClickTime: 0 });

    const requiredLevel = challenge.requiredEmpireLevel(currentLevel + 1);
    const empireLevel = useProperty(Packets.level);
    const meetsRequirement = empireLevel >= requiredLevel;

    const handleStartClick = () => {
        const currentTime = tick();

        if (confirmationState.showConfirmation && currentTime - confirmationState.lastClickTime < 3) {
            // Send challenge start packet to server
            const success = Packets.startChallenge.toServer(challenge.id);
            setConfirmationState({ showConfirmation: false, lastClickTime: currentTime });
            if (success) {
                playSound("MagicCast.mp3");
            } else {
                playSound("Error.mp3");
            }
        } else {
            // Show confirmation
            setConfirmationState({ showConfirmation: true, lastClickTime: currentTime });
        }
    };

    const handleToggleExpand = () => {
        playSound(isExpanded ? "CheckOff.mp3" : "CheckOn.mp3");
        if (!isExpanded) {
            setIsAnimating(true);
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <frame
            ref={(instance) => {
                if (!instance) return;
                if (isExpanded && isAnimating) {
                    const targetSize = new UDim2(1, 0, 0, 150);
                    TweenService.Create(instance, new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
                        Size: targetSize,
                    }).Play();
                    task.delay(0.2, () => setIsAnimating(false));
                } else if (!isExpanded) {
                    TweenService.Create(instance, new TweenInfo(0.3, Enum.EasingStyle.Quart, Enum.EasingDirection.In), {
                        Size: new UDim2(1, 0, 0, 50),
                    }).Play();
                }
            }}
            BackgroundTransparency={1}
            Size={isExpanded && !isAnimating ? new UDim2(1, 0, 0, 150) : new UDim2(1, 0, 0, 50)}
            AutomaticSize={isExpanded ? Enum.AutomaticSize.None : Enum.AutomaticSize.Y}
        >
            {/* Background decorative images */}
            <imagelabel
                ref={(instance) => {
                    if (!instance) return;
                    const targetTransparency = isHovered ? 0.4 : 0.6;
                    TweenService.Create(instance, new TweenInfo(0.3), { ImageTransparency: targetTransparency }).Play();
                }}
                AnchorPoint={new Vector2(0, 1)}
                BackgroundTransparency={1}
                Image={getAsset("assets/challenge/ChallengeOptionBackground.png")}
                ImageColor3={Color3.fromRGB(0, 0, 0)}
                ImageTransparency={0.6}
                Position={new UDim2(0, 0, 1, -4)}
                Size={new UDim2(0.96, 0, 1, 0)}
                ZIndex={-2}
            >
                <imagelabel
                    BackgroundTransparency={1}
                    Image={getAsset("assets/challenge/ChallengeOptionOverlay.png")}
                    ImageTransparency={0.95}
                    Size={new UDim2(1, 0, 1, 0)}
                    ZIndex={-2}
                />
            </imagelabel>

            {/* Dropdown Toggle Button */}
            <textbutton
                BackgroundTransparency={1}
                BorderSizePixel={0}
                Position={new UDim2(0, 0, 0, 0)}
                Size={new UDim2(1, 0, 0, 40)}
                Text=""
                Event={{
                    Activated: handleToggleExpand,
                    MouseEnter: () => setIsHovered(true),
                    MouseLeave: () => setIsHovered(false),
                }}
            >
                <uicorner CornerRadius={new UDim(0.1, 0)} />
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, challenge.colors.primary),
                                new ColorSequenceKeypoint(1, challenge.colors.secondary),
                            ])
                        }
                    />
                </uistroke>

                {/* Challenge Title */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0.05, 0, 0, 0)}
                    Size={new UDim2(0.75, 0, 1, 0)}
                    Text={`${challenge.name} ${toNumeral(currentLevel + 1)}`}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={2} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, challenge.colors.primary),
                                new ColorSequenceKeypoint(1, challenge.colors.secondary),
                            ])
                        }
                    />
                    <uipadding
                        PaddingBottom={new UDim(0, 5)}
                        PaddingLeft={new UDim(0, 5)}
                        PaddingRight={new UDim(0, 5)}
                        PaddingTop={new UDim(0, 5)}
                    />
                </textlabel>

                {/* Required Empire Level */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0.65, 0, 0, 0)}
                    Size={new UDim2(0.2, 0, 1, 0)}
                    Text={`Lv. ${requiredLevel}`}
                    TextColor3={meetsRequirement ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 80, 80)}
                    TextScaled={true}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Right}
                >
                    <uistroke Thickness={2} />
                    <uipadding
                        PaddingBottom={new UDim(0, 5)}
                        PaddingLeft={new UDim(0, 5)}
                        PaddingRight={new UDim(0, 5)}
                        PaddingTop={new UDim(0, 5)}
                    />
                </textlabel>

                {/* Dropdown Arrow */}
                <imagelabel
                    ref={(instance) => {
                        if (!instance) return;
                        TweenService.Create(instance, new TweenInfo(0.2), { Rotation: isExpanded ? 180 : 0 }).Play();
                    }}
                    BackgroundTransparency={1}
                    Position={new UDim2(0.85, 0, 0.1, 0)}
                    Size={new UDim2(0.1, 0, 0.8, 0)}
                    Image={getAsset("assets/Dropdown.png")}
                    ScaleType={Enum.ScaleType.Fit}
                />
            </textbutton>

            {/* Expanded Content */}
            {isExpanded && (
                <frame
                    ref={(instance) => {
                        if (!instance) return;
                        if (isAnimating) {
                            instance.GetDescendants().forEach((descendant) => {
                                if (descendant.IsA("TextLabel")) {
                                    TweenService.Create(
                                        descendant,
                                        new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                                        { TextTransparency: 0, TextStrokeTransparency: 0 },
                                    ).Play();
                                    descendant.GetChildren().forEach((child) => {
                                        if (child.IsA("UIStroke")) {
                                            TweenService.Create(
                                                child,
                                                new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                                                { Transparency: 0 },
                                            ).Play();
                                        }
                                    });
                                } else if (descendant.IsA("TextButton")) {
                                    TweenService.Create(
                                        descendant,
                                        new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                                        { BackgroundTransparency: 0, TextTransparency: 0 },
                                    ).Play();
                                    descendant.GetChildren().forEach((child) => {
                                        if (child.IsA("UIStroke")) {
                                            TweenService.Create(
                                                child,
                                                new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                                                { Transparency: 0 },
                                            ).Play();
                                        }
                                        if (child.IsA("UIGradient")) {
                                            task.delay(0, () => {
                                                child.Transparency = new NumberSequence(0);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }}
                    BackgroundTransparency={1}
                    Position={new UDim2(0, 0, 0, 45)}
                    Size={new UDim2(1, 0, 1, -45)}
                >
                    {/* Description Section */}
                    <frame
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        Position={new UDim2(0.5, 0, 0, 0)}
                        Size={new UDim2(0.85, 0, 0.6, 0)}
                    >
                        <uilistlayout
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalFlex={Enum.UIFlexAlignment.SpaceBetween}
                        />

                        {/* Description */}
                        <textlabel
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabMedium}
                            Size={new UDim2(1, 0, 0, 0)}
                            Text={challenge.description(currentLevel + 1)}
                            TextColor3={Color3.fromRGB(209, 209, 209)}
                            TextScaled={true}
                            TextStrokeTransparency={isAnimating ? 1 : 0}
                            TextTransparency={isAnimating ? 1 : 0}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            TextYAlignment={Enum.TextYAlignment.Top}
                        >
                            <uitextsizeconstraint MaxTextSize={22} />
                            <uiflexitem />
                        </textlabel>

                        {/* Requirement */}
                        <textlabel
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabMedium}
                            Size={new UDim2(1, 0, 0, 0)}
                            Text={`Task: ${challenge.getTaskLabel()}`}
                            TextColor3={Color3.fromRGB(126, 255, 145)}
                            TextScaled={true}
                            TextStrokeTransparency={isAnimating ? 1 : 0}
                            TextTransparency={isAnimating ? 1 : 0}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            TextYAlignment={Enum.TextYAlignment.Top}
                        >
                            <uitextsizeconstraint MaxTextSize={18} />
                            <uiflexitem />
                        </textlabel>

                        {/* Reward Label */}
                        <textlabel
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabMedium}
                            Size={new UDim2(1, 0, 0, 0)}
                            Text={`Reward: ${challenge.getRewardLabel(currentLevel)}`}
                            TextColor3={Color3.fromRGB(255, 215, 100)}
                            TextScaled={true}
                            TextStrokeTransparency={isAnimating ? 1 : 0}
                            TextTransparency={isAnimating ? 1 : 0}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            TextYAlignment={Enum.TextYAlignment.Top}
                        >
                            <uitextsizeconstraint MaxTextSize={18} />
                            <uiflexitem />
                        </textlabel>
                    </frame>

                    {/* Start Button */}
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                        BackgroundTransparency={isAnimating ? 1 : 0}
                        BorderSizePixel={0}
                        Position={new UDim2(0.55, 0, 0.5, 0)}
                        Size={new UDim2(0.35, 0, 0.35, 0)}
                        Text=""
                        Event={{
                            Activated: handleStartClick,
                        }}
                    >
                        <uistroke
                            ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                            Thickness={2}
                            Transparency={isAnimating ? 1 : 0}
                        />
                        <uicorner CornerRadius={new UDim(0.2, 0)} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 127)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 157, 0)),
                                ])
                            }
                            Rotation={90}
                            Transparency={isAnimating ? new NumberSequence(1) : new NumberSequence(0)}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabHeavy}
                            Size={new UDim2(1, 0, 1, 0)}
                            Text={confirmationState.showConfirmation ? "Are you sure?" : "Enter"}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            TextTransparency={isAnimating ? 1 : 0}
                            TextWrapped={true}
                        >
                            <uistroke Thickness={3}>
                                <uigradient
                                    Color={
                                        new ColorSequence([
                                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                            new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                                        ])
                                    }
                                    Rotation={90}
                                />
                            </uistroke>
                        </textlabel>
                        <uipadding
                            PaddingBottom={new UDim(0, 7)}
                            PaddingLeft={new UDim(0, 7)}
                            PaddingRight={new UDim(0, 7)}
                            PaddingTop={new UDim(0, 7)}
                        />
                    </textbutton>
                </frame>
            )}
        </frame>
    );
}

/**
 * Current challenge display component
 */
function CurrentChallenge({ challengeId, currentLevel = 0 }: { challengeId?: string; currentLevel?: number }) {
    const challenge = challengeId ? CHALLENGE_PER_ID.get(challengeId) : undefined;
    if (challenge === undefined || challengeId === undefined) {
        return <Fragment />;
    }

    const [debounce, setDebounce] = useState(0);

    const handleQuitClick = () => {
        const currentTime = os.clock();
        if (currentTime - debounce < 1) return;
        setDebounce(currentTime);

        playSound("MagicCast.mp3");
        Packets.quitChallenge.toServer();
    };

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0.75, 0)}>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* "You are currently in:" label */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(0.9, 0, 0.15, 0)}
                Text="You are currently in:"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
            >
                <uistroke Thickness={3} />
            </textlabel>

            {/* Challenge Title */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={2}
                Size={new UDim2(1, 0, 0.2, 0)}
                Text={challenge.name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
            >
                <uistroke Thickness={4} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, challenge.colors.primary),
                            new ColorSequenceKeypoint(1, challenge.colors.secondary),
                        ])
                    }
                />
            </textlabel>

            {/* Spacer */}
            <frame BackgroundTransparency={1} LayoutOrder={3} Size={new UDim2(0, 0, 0.1, 0)} />

            {/* Requirement Label */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={2}
                Size={new UDim2(0.9, 0, 0.1, 0)}
                Text={challenge.description(currentLevel)}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
            >
                <uistroke Thickness={3} />
            </textlabel>

            {/* Quit Button */}
            <textbutton
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                LayoutOrder={4}
                Size={new UDim2(0.3, 0, 0.15, 0)}
                Text=""
                Event={{
                    Activated: handleQuitClick,
                }}
            >
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                <uicorner CornerRadius={new UDim(0.2, 0)} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 96, 75)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(180, 32, 32)),
                        ])
                    }
                    Rotation={90}
                />
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text="Quit"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextWrapped={true}
                >
                    <uistroke Thickness={3}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>
                <uipadding
                    PaddingBottom={new UDim(0, 7)}
                    PaddingLeft={new UDim(0, 7)}
                    PaddingRight={new UDim(0, 7)}
                    PaddingTop={new UDim(0, 7)}
                />
            </textbutton>
        </frame>
    );
}

/**
 * Main Challenge GUI component
 */
function ChallengeGui({ adornee }: { adornee: BasePart }) {
    const currentChallengeId = useProperty(Packets.currentChallenge);
    const currentLevelPerChallenge = useProperty(Packets.currentLevelPerChallenge);
    const isInChallenge = currentChallengeId !== undefined && currentChallengeId !== "";
    const challengeOptions = new Array<JSX.Element>();
    for (const challenge of Challenge.CHALLENGES) {
        const currentLevel = currentLevelPerChallenge.get(challenge.id) ?? 0;
        challengeOptions.push(<ChallengeOption challenge={challenge} currentLevel={currentLevel} />);
    }

    useEffect(() => {
        const connection = Packets.challengeCompleted.fromServer((challenge, rewardLabel) => {
            // Play completion sound
            playSound("MagicCast.mp3");

            // Could show a completion notification here
            print(`Challenge completed: ${challenge} - Rewards: ${rewardLabel}`);
        });

        return () => connection.Disconnect();
    }, []);

    return (
        <surfacegui
            Adornee={adornee}
            ClipsDescendants={true}
            MaxDistance={30}
            ResetOnSpawn={false}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0.04, 0)}
            />

            {/* Title */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabExtraBold}
                Size={new UDim2(0.9, 0, 0.125, 0)}
                Text="Challenges"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={3} />
            </textlabel>

            {/* Challenge Options (when not in challenge) */}
            {!isInChallenge && (
                <scrollingframe
                    Active={true}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    LayoutOrder={1}
                    Selectable={false}
                    Size={new UDim2(1, 0, 0.75, 0)}
                    Visible={true}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        Padding={new UDim(0, 5)}
                    />

                    {challengeOptions}
                </scrollingframe>
            )}

            <CurrentChallenge
                challengeId={currentChallengeId}
                currentLevel={currentLevelPerChallenge.get(currentChallengeId) ?? 0}
            />
        </surfacegui>
    );
}

export = new Item(script.Name)
    .setName("Challenges Board")
    .setDescription("A board that offers various challenges to complete.")
    .setDifficulty(Difficulty.Bonuses)
    .placeableEverywhere()
    .onLoad((model) => {
        if (Sandbox.getEnabled()) {
            const questMetadata = Server.empireData.questMetadata;

            questMetadata.set("ChallengesUnlocked", true);
            Server.Challenge.refreshChallenges();

            model.Destroying.Connect(() => {
                questMetadata.set("ChallengesUnlocked", false);
            });
        }
    })
    .onClientLoad((model) => {
        const board = model.WaitForChild("ChallengesBoard") as BasePart;

        const root = createRoot(board);
        root.render(<ChallengeGui adornee={board} />);

        model.Destroying.Connect(() => {
            root.unmount();
        });
    });
