import React from "@rbxts/react";
import { RobotoSlabBold } from "shared/asset/GameFonts";

/**
 * Displays current challenge information as a HUD overlay
 */
export default function ChallengeHudDisplay({
    challengeName,
    challengeDescription,
    challengeColors,
}: {
    challengeName: string;
    challengeDescription: string;
    challengeColors: {
        primary: Color3;
        secondary: Color3;
    };
}) {
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
                Text={challengeName}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, challengeColors.primary),
                            new ColorSequenceKeypoint(1, challengeColors.secondary),
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
                Text={challengeDescription}
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
