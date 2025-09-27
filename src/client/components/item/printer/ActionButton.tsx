import React, { useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { RobotoSlabBold } from "shared/asset/GameFonts";

export default function ActionButton({
    text,
    backgroundColor,
    layoutOrder,
    onClick,
}: {
    text: string;
    backgroundColor: Color3;
    layoutOrder?: number;
    onClick?: () => void;
}) {
    const buttonRef = useRef<TextButton>();
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleHoverEnter = () => {
        if (isAnimating || !buttonRef.current) return;

        setIsHovered(true);

        // Smooth scale up and glow effect on hover
        const hoverTween = TweenService.Create(
            buttonRef.current,
            new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {
                Size: new UDim2(0.22, 0, 0.85, 0),
            },
        );

        hoverTween.Play();
    };

    const handleHoverLeave = () => {
        if (isAnimating || !buttonRef.current) return;

        setIsHovered(false);

        // Smooth scale back down
        const unhoverTween = TweenService.Create(
            buttonRef.current,
            new TweenInfo(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {
                Size: new UDim2(0.2, 0, 0.8, 0),
            },
        );

        unhoverTween.Play();
    };

    const handleClick = () => {
        if (isAnimating || !buttonRef.current) return;

        setIsAnimating(true);

        const tweenInfo = new TweenInfo(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out, 0, false, 0);

        // Scale down first
        const scaleDown = TweenService.Create(buttonRef.current, new TweenInfo(0.1), {
            Size: isHovered ? new UDim2(0.2, 0, 0.77, 0) : new UDim2(0.18, 0, 0.72, 0),
        });

        // Then scale back up with bounce
        const scaleUp = TweenService.Create(buttonRef.current, tweenInfo, {
            Size: isHovered ? new UDim2(0.22, 0, 0.85, 0) : new UDim2(0.2, 0, 0.8, 0),
        });

        scaleDown.Play();
        scaleDown.Completed.Connect(() => {
            scaleUp.Play();
            scaleUp.Completed.Connect(() => {
                setIsAnimating(false);
            });
        });

        // Call the original onClick after a small delay
        if (onClick) {
            onClick();
        }
    };

    return (
        <textbutton
            ref={buttonRef}
            AutoButtonColor={false}
            BackgroundColor3={isHovered ? backgroundColor.Lerp(Color3.fromRGB(255, 255, 255), 0.15) : backgroundColor}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(0.2, 0, 0.8, 0)}
            Text={""}
            TextColor3={Color3.fromRGB(0, 0, 0)}
            TextSize={14}
            Event={{
                Activated: handleClick,
                MouseEnter: handleHoverEnter,
                MouseLeave: handleHoverLeave,
            }}
        >
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Thickness={2}
                Color={isHovered ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(0, 0, 0)}
                Transparency={0}
            />
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.9, 0, 0.4, 0)}
                Text={text}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={1.5} />
            </textlabel>
        </textbutton>
    );
}
