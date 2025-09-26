import React, { Fragment } from "@rbxts/react";
import { RobotoSlabBold, RobotoSlabExtraBold, RobotoSlabHeavy, RobotoSlabMedium } from "client/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import ChallengesBoard from "shared/world/nodes/ChallengesBoard";

export interface CurrentChallengeInfo {
    name: string;
    description: string;
    colors: {
        primary: Color3;
        secondary: Color3;
    };
}

/**
 * Individual challenge option component
 */
function ChallengeOption({
    key,
    challenge,
    onStart,
}: {
    key: string;
    challenge: ChallengeInfo;
    onStart: (id: string) => void;
}) {
    const [confirmationState, setConfirmationState] = React.useState<{
        showConfirmation: boolean;
        lastClickTime: number;
    }>({ showConfirmation: false, lastClickTime: 0 });

    const handleStartClick = () => {
        const currentTime = tick();

        if (confirmationState.showConfirmation && currentTime - confirmationState.lastClickTime < 3) {
            // Confirmed start
            onStart(key);
            setConfirmationState({ showConfirmation: false, lastClickTime: currentTime });
        } else {
            // Show confirmation
            setConfirmationState({ showConfirmation: true, lastClickTime: currentTime });
        }
    };

    const primaryColor = Color3.fromRGB(challenge.r1, challenge.g1, challenge.b1);
    const secondaryColor = Color3.fromRGB(challenge.r2, challenge.g2, challenge.b2);

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 150)}>
            {/* Title */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0.025, 0, 0.05, 0)}
                Size={new UDim2(0.5, 0, 0.25, 0)}
                Text={challenge.name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, primaryColor),
                            new ColorSequenceKeypoint(1, secondaryColor),
                        ])
                    }
                />
            </textlabel>

            {/* Background decorative images */}
            <imagelabel
                AnchorPoint={new Vector2(0, 1)}
                BackgroundTransparency={1}
                Image={getAsset("assets/challenge/ChallengeOptionBackground.png")}
                ImageColor3={Color3.fromRGB(0, 0, 0)}
                ImageTransparency={0.6}
                Position={new UDim2(0, 2, 1, 0)}
                Size={new UDim2(0.96, 0, 0.825, 0)}
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

            {/* Start Button */}
            <textbutton
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Position={new UDim2(0.55, 0, 0.5, 0)}
                Size={new UDim2(0.35, 0, 0.35, 0)}
                Text=""
                Event={{
                    Activated: handleStartClick,
                }}
            >
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                <uicorner CornerRadius={new UDim(0.2, 0)} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 127)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 157, 0)),
                        ])
                    }
                    Rotation={90}
                />
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={confirmationState.showConfirmation ? "Are you sure?" : "Start"}
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

            {/* Description Section */}
            <frame BackgroundTransparency={1} Position={new UDim2(0.025, 0, 0.325, 0)} Size={new UDim2(0.5, 0, 0.6, 0)}>
                <uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} VerticalFlex={Enum.UIFlexAlignment.SpaceBetween} />

                {/* Description */}
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={challenge.description}
                    TextColor3={Color3.fromRGB(209, 209, 209)}
                    TextScaled={true}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                >
                    <uitextsizeconstraint MaxTextSize={22} />
                    <uiflexitem />
                </textlabel>

                {/* Notice */}
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
                    LayoutOrder={1}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={challenge.notice}
                    TextColor3={Color3.fromRGB(172, 172, 172)}
                    TextScaled={true}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                >
                    <uitextsizeconstraint MaxTextSize={16} />
                    <uiflexitem />
                </textlabel>

                {/* Requirement */}
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
                    LayoutOrder={99}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text={`Task: ${challenge.task}`}
                    TextColor3={Color3.fromRGB(126, 255, 145)}
                    TextScaled={true}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                >
                    <uitextsizeconstraint MaxTextSize={18} />
                    <uiflexitem />
                </textlabel>

                {/* Spacer */}
                <frame BackgroundTransparency={1} LayoutOrder={88}>
                    <uiflexitem FlexMode={Enum.UIFlexMode.Grow} />
                </frame>
            </frame>

            {/* Reward Label */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0.55, 0, 0.25, 0)}
                Size={new UDim2(0.35, 0, 0.175, 0)}
                Text={challenge.reward}
                TextColor3={Color3.fromRGB(126, 255, 145)}
                TextScaled={true}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>
        </frame>
    );
}

/**
 * Current challenge display component
 */
function CurrentChallenge({ challenge, onQuit }: { challenge: CurrentChallengeInfo; onQuit: () => void }) {
    const [debounce, setDebounce] = React.useState(0);

    const handleQuitClick = () => {
        const currentTime = tick();
        if (currentTime - debounce < 1) return;

        setDebounce(currentTime);
        onQuit();
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
                Text={challenge.description}
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
export default function ChallengeGui({
    challenges,
    currentChallenge,
    onStartChallenge,
    onQuitChallenge,
}: {
    challenges: Map<string, ChallengeInfo>;
    currentChallenge?: CurrentChallengeInfo;
    onStartChallenge: (challengeId: string) => void;
    onQuitChallenge: () => void;
}) {
    const isInChallenge = currentChallenge !== undefined;

    if (!isInChallenge && challenges.size() === 0) {
        return <Fragment />;
    }

    const challengeOptions = new Array<JSX.Element>();
    for (const [key, challenge] of challenges) {
        challengeOptions.push(<ChallengeOption key={key} challenge={challenge} onStart={onStartChallenge} />);
    }

    return (
        <surfacegui
            Adornee={ChallengesBoard.waitForInstance()}
            ClipsDescendants={true}
            MaxDistance={30}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            {/* Title */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabExtraBold}
                Size={new UDim2(0.9, 0, 0.15, 0)}
                Text="Challenges"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={3} />
            </textlabel>

            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Challenge Options (when not in challenge) */}
            {!isInChallenge && (
                <scrollingframe
                    Active={true}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    LayoutOrder={1}
                    Selectable={false}
                    Size={new UDim2(0.9, 0, 0.75, 0)}
                    Visible={true}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />

                    {challengeOptions}
                </scrollingframe>
            )}

            {/* Current Challenge (when in challenge) */}
            {isInChallenge && currentChallenge && (
                <CurrentChallenge challenge={currentChallenge} onQuit={onQuitChallenge} />
            )}
        </surfacegui>
    );
}
