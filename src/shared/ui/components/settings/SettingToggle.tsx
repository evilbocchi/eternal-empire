import React from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMonoBold } from "shared/ui/GameFonts";

interface SettingToggleProps {
    title: string;
    subtitle?: string;
    enabled: boolean;
    layoutOrder?: number;
    onToggle?: (enabled: boolean) => void;
}

export default function SettingToggle({ title, subtitle, enabled, layoutOrder = 0, onToggle }: SettingToggleProps) {
    const [hovering, setHovering] = React.useState(false);
    const color = enabled ? Color3.fromRGB(170, 255, 127) : Color3.fromRGB(255, 52, 52);
    const hoverColor = color.Lerp(Color3.fromRGB(255, 255, 255), 0.5);
    const buttonRef = React.useRef<TextButton>();

    const handleToggle = () => {
        const newEnabled = !enabled;

        // Play appropriate sound based on the new state
        if (newEnabled) {
            playSound("CheckOn.mp3");
        } else {
            playSound("CheckOff.mp3");
        }

        onToggle?.(newEnabled);
    };

    return (
        <frame
            BackgroundTransparency={1}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 40)}
        >
            <textbutton
                key="Toggle"
                ref={buttonRef}
                AnchorPoint={new Vector2(1, 0.5)}
                AutoButtonColor={false}
                BackgroundColor3={hovering ? hoverColor : color}
                BorderColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={3}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.975, 0, 0.5, 0)}
                Size={new UDim2(0.75, 0, 0.75, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                Text=""
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={Color3.fromRGB(153, 102, 0)}
                TextStrokeTransparency={0}
                TextWrapped={true}
                ZIndex={25}
                Event={{
                    Activated: handleToggle,
                    MouseEnter: () => {
                        setHovering(true);
                        playSound("EmphasisButtonHover.mp3", undefined, (sound) => {
                            sound.Volume = 0.1;
                            sound.PlaybackSpeed = enabled ? 2 : 1.75;
                        });
                    },
                    MouseLeave: () => {
                        setHovering(false);
                        TweenService.Create(buttonRef.current!, new TweenInfo(0.2), { BackgroundColor3: color }).Play();
                    }
                }}
            >
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131))
                    ])}
                    Rotation={90}
                />
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={color}
                    Thickness={2}
                >
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))
                        ])}
                    />
                </uistroke>
                <uistroke Color={color}>
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109))
                        ])}
                    />
                </uistroke>
            </textbutton>
            <textlabel
                key="Title"
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                LayoutOrder={-1}
                Position={new UDim2(0.025, 0, 0.5, 0)}
                RichText={subtitle !== undefined}
                Text={subtitle ? `${title}\n<font color="#bebebe" size="14">${subtitle}</font>` : title}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={subtitle ? 25 : 30}
                TextStrokeTransparency={0}
                TextXAlignment={Enum.TextXAlignment.Left}
                ZIndex={25}
            />
        </frame>
    );
}
