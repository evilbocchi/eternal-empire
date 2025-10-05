import React, { forwardRef, Ref } from "@rbxts/react";
import { RobotoSlabHeavy } from "shared/asset/GameFonts";

interface WindowTitleProps {
    icon: string;
    title: string;
    font?: Font;
    iconRef?: Ref<ImageLabel>;
    textRef?: Ref<TextLabel>;
}

const WindowTitle = forwardRef<Frame, WindowTitleProps>(
    ({ icon, title, font = RobotoSlabHeavy, iconRef, textRef }, ref) => {
        return (
            <frame
                ref={ref}
                key="Title"
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Position={new UDim2(0, 12, 0, 5)}
                Size={new UDim2(0, 0, 0.04, 30)}
            >
                <frame
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                >
                    <imagelabel
                        ref={iconRef}
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        Image={icon}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        ScaleType={Enum.ScaleType.Fit}
                        Size={new UDim2(1, 0, 1, 0)}
                        ZIndex={2}
                    />
                </frame>
                <frame BackgroundTransparency={1} AutomaticSize={Enum.AutomaticSize.X} Size={new UDim2(0, 0, 1, 0)}>
                    <textlabel
                        ref={textRef}
                        AnchorPoint={new Vector2(0, 0.5)}
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={font}
                        Position={new UDim2(0, 0, 0.5, 0)}
                        Size={new UDim2(0, 0, 0.8, 0)}
                        Text={title}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                </frame>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                />
            </frame>
        );
    },
);

export default WindowTitle;
