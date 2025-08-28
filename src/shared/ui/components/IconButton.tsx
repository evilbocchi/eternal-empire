import React, { useRef, InstanceProps } from "@rbxts/react";
import { TweenService } from "@rbxts/services";

interface IconButtonProps {
    image: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    buttonProps?: InstanceProps<ImageButton>;
}

export default function IconButton(props: IconButtonProps) {
    const buttonRef = useRef<ImageButton>();

    const handleClick = () => {
        
        props.onClick?.();
    };

    const handleMouseEnter = () => {
        buttonRef.current!.ImageColor3 = new Color3(0.8, 0.8, 0.8);
        props.onMouseEnter?.();
    };

    const handleMouseLeave = () => {
        TweenService.Create(buttonRef.current!, new TweenInfo(0.2), {
            ImageColor3: new Color3(1, 1, 1)
        }).Play();
        props.onMouseLeave?.();
    };

    return (
        <imagebutton
            ref={buttonRef}
            BackgroundTransparency={1}
            Image={props.image}
            Event={{
                Activated: handleClick,
                MouseEnter: handleMouseEnter,
                MouseLeave: handleMouseLeave
            }}
            {...props.buttonProps}
        >
            <uiaspectratioconstraint />
        </imagebutton>
    );
}