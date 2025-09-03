import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import { RobotoMonoBold } from "shared/ui/GameFonts";
import useProperty from "shared/ui/hooks/useProperty";

interface SettingToggleProps {
    setting: keyof Settings;
    title?: string;
    subtitle?: string;
    layoutOrder?: number;
}

export default function SettingToggle({ setting, title, subtitle, layoutOrder = 0 }: SettingToggleProps) {
    title ??= setting;

    const [hovering, setHovering] = useState(false);
    const [justClicked, setJustClicked] = useState(false);
    const settings = useProperty(Packets.settings);
    const enabled = settings[setting] === true;

    const color = enabled ? Color3.fromRGB(170, 255, 127) : Color3.fromRGB(255, 52, 52);
    const hoverColor = color.Lerp(Color3.fromRGB(255, 255, 255), 0.5);
    const buttonRef = useRef<TextButton>();

    useEffect(() => {
        TweenService.Create(buttonRef.current!, new TweenInfo(0.2), {
            BackgroundColor3: hovering && !justClicked ? hoverColor : color,
        }).Play();
    }, [hovering, enabled, justClicked]);

    // Reset justClicked state after a short delay
    useEffect(() => {
        if (justClicked) {
            task.delay(0.3, () => {
                setJustClicked(false);
            });
        }
    }, [justClicked]);

    const handleToggle = () => {
        const newEnabled = !enabled;

        setJustClicked(true);

        // Play appropriate sound based on the new state
        if (newEnabled) {
            playSound("CheckOn.mp3");
        } else {
            playSound("CheckOff.mp3");
        }

        Packets.setSetting.toServer(setting, newEnabled);
    };

    return (
        <frame BackgroundTransparency={1} LayoutOrder={layoutOrder} Size={new UDim2(1, 0, 0, 40)}>
            <textbutton
                key="Toggle"
                ref={buttonRef}
                AnchorPoint={new Vector2(1, 0.5)}
                AutoButtonColor={false}
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
                    MouseLeave: () => setHovering(false),
                }}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.456, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(131, 131, 131)),
                        ])
                    }
                    Rotation={90}
                />
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={color} Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109)),
                            ])
                        }
                    />
                </uistroke>
                <uistroke Color={color}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(109, 109, 109)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(109, 109, 109)),
                            ])
                        }
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
