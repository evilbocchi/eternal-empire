import React from "@rbxts/react";
import { RobotoSlabBold } from "client/ui/GameFonts";

interface WindowTitleProps {
    icon: string;
    title: string;
    font?: Font;
}

export default function WindowTitle({ icon, title, font = RobotoSlabBold }: WindowTitleProps) {
    return (
        <frame
            key="Title"
            AnchorPoint={new Vector2(0, 0.5)}
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            Position={new UDim2(0, -15, 0, 0)}
            Size={new UDim2(0, 0, 0.04, 30)}
        >
            <imagelabel
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                Image={icon}
                Position={new UDim2(0.025, 0, 0, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(1, 0, 1, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                ZIndex={2}
            />
            <textlabel
                AnchorPoint={new Vector2(0, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={font}
                Position={new UDim2(0.1, 15, 0, 0)}
                Size={new UDim2(0, 0, 0.8, 0)}
                Text={title}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />
        </frame>
    );
}
