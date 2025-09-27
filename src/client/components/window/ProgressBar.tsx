import React, { InstanceProps, useMemo } from "@rbxts/react";
import { RobotoSlabBold } from "shared/asset/GameFonts";

export default function ProgressBar(props: {
    current: number;
    max: number;
    text?: string;
    colorSequence: ColorSequence;
    fontFace?: Font;
    frameProps: InstanceProps<Frame>;
}) {
    const tintedColorSequence = useMemo(() => {
        const keypoints = new Array<ColorSequenceKeypoint>();
        const size = props.colorSequence.Keypoints.size();
        for (let i = 0; i < size; i++) {
            const keypoint = props.colorSequence.Keypoints[i];
            const alpha = 1 - (i + 1) / size;
            keypoints.push(
                new ColorSequenceKeypoint(keypoint.Time, keypoint.Value.Lerp(Color3.fromRGB(255, 255, 255), alpha)),
            );
        }
        return new ColorSequence(keypoints);
    }, [props.colorSequence]);

    return (
        <frame
            key="ProgressBar"
            BackgroundColor3={Color3.fromRGB(39, 39, 39)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={5}
            {...props.frameProps}
        >
            <textlabel
                key="BarLabel"
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={props.fontFace ?? RobotoSlabBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                Text={props.text ?? `${props.current}/${props.max}`}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                ZIndex={2}
            >
                <uistroke Thickness={2} />
            </textlabel>

            <frame
                key="Fill"
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Size={new UDim2(math.clamp(props.current / props.max, 0, 1), 0, 1, 0)}
                Visible={props.current > 0}
            >
                <uigradient Color={props.colorSequence} Rotation={90} />
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3}>
                    <uigradient Color={tintedColorSequence} Rotation={90} />
                </uistroke>
            </frame>

            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(48, 48, 48)} Thickness={3} />
        </frame>
    );
}
