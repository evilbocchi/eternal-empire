import React from "@rbxts/react";
import AreaBoardGui from "client/ui/components/area/AreaBoardGui";
import { RobotoMonoBold, RobotoSlabHeavy } from "client/ui/GameFonts";
import { AREAS } from "shared/world/Area";

export default function BarrenIslandsBoardGui() {
    return (
        <AreaBoardGui areaId="BarrenIslands" dropletCount={0} dropletLimit={0}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.1, 0)}
                Text="Barren Islands"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Color={Color3.fromRGB(121, 177, 88)} Thickness={4}>
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
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 0.25, 0)}
                Text="An abandoned region inhabited by only the most unfortunate. Desolate and devoid of resources, the only beacon of hope shining upon this forbidden wasteland is the beginning of a capitalistic empire."
                TextColor3={Color3.fromRGB(195, 195, 195)}
                TextScaled={true}
                TextSize={25}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2} />
                <uitextsizeconstraint MaxTextSize={50} />
            </textlabel>
        </AreaBoardGui>
    );
}
