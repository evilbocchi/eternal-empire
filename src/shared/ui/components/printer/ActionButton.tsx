import React from "@rbxts/react";
import { RobotoSlabBold } from "shared/ui/GameFonts";

interface ActionButtonProps {
    text: string;
    backgroundColor: Color3;
    layoutOrder?: number;
    onClick?: () => void;
}

function ActionButton({ text, backgroundColor, layoutOrder, onClick }: ActionButtonProps) {
    return (
        <textbutton
            BackgroundColor3={backgroundColor}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(0.2, 0, 0.8, 0)}
            Text={""}
            TextColor3={Color3.fromRGB(0, 0, 0)}
            TextSize={14}
            Event={{
                Activated: onClick
            }}
        >
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
            <textlabel
                key="Label"
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

export default ActionButton;
