import React, { Fragment } from "@rbxts/react";
import useProperty from "client/hooks/useProperty";
import { RobotoSlabBold } from "shared/asset/GameFonts";
import { CHALLENGE_PER_ID } from "shared/Challenge";
import Packets from "shared/Packets";

/**
 * Displays current challenge information as a HUD overlay
 */
export default function ChallengeHudWindow() {
    const currentChallengeId = useProperty(Packets.currentChallenge);
    const currentLevel = useProperty(Packets.currentLevelPerChallenge).get(currentChallengeId) ?? 0;
    const currentChallenge = CHALLENGE_PER_ID.get(currentChallengeId);

    if (!currentChallenge) {
        return <Fragment />;
    }

    return (
        <frame
            AnchorPoint={new Vector2(0.5, 0)}
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.078, 35)}
            Size={new UDim2(1, -300, 0, 0)}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(0.9, 0, 0, 0)}
                Text="You are currently in:"
                TextColor3={Color3.fromRGB(255, 103, 103)}
                TextSize={24}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Challenge Title */}
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={2}
                Size={new UDim2(1, 0, 0, 0)}
                Text={currentChallenge.name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, currentChallenge.colors.primary),
                            new ColorSequenceKeypoint(1, currentChallenge.colors.secondary),
                        ])
                    }
                />
            </textlabel>

            {/* Challenge Description/Requirement */}
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={3}
                Size={new UDim2(0.9, 0, 0, 0)}
                Text={currentChallenge.description(currentLevel)}
                TextColor3={Color3.fromRGB(255, 103, 103)}
                TextSize={20}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2} />
                <uitextsizeconstraint MaxTextSize={24} />
            </textlabel>
        </frame>
    );
}
