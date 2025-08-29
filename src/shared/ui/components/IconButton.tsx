import React, { InstanceProps, useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { useHover } from "shared/ui/hooks/useHover";

interface IconButtonProps {
    image: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    buttonProps?: InstanceProps<ImageButton>;
}

export default function IconButton(props: IconButtonProps) {
    const buttonRef = useRef<ImageButton>();
    const scaleRef = useRef<UIScale>();

    const { hovering, events } = useHover(props.onMouseEnter, props.onMouseLeave);
    const color = hovering ? new Color3(0.8, 0.8, 0.8) : new Color3(1, 1, 1);
    const scale = hovering ? 1.05 : 1;
    useEffect(() => {
        const tweenInfo = new TweenInfo(0.2);
        TweenService.Create(buttonRef.current!, tweenInfo, { ImageColor3: color }).Play();
        TweenService.Create(scaleRef.current!, tweenInfo, { Scale: scale }).Play();
    }, [hovering]);

    const handleClick = () => {
        scaleRef.current!.Scale = 0.9;
        TweenService.Create(scaleRef.current!, new TweenInfo(0.5), { Scale: scale }).Play();
        props.onClick?.();
    };

    return (
        <imagebutton
            ref={buttonRef}
            BackgroundTransparency={1}
            Image={props.image}
            Event={{
                Activated: handleClick,
                ...events
            }}
            {...props.buttonProps}
        >
            <uiscale ref={scaleRef} />
            <uiaspectratioconstraint />
        </imagebutton>
    );
}