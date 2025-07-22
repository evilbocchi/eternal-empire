import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { RobotoSlabBold } from "shared/ui/GameFonts";

interface SetupHeaderProps {
    setupName: string;
    cost: string;
    onEditClick?: () => void;
}

function SetupHeader({ setupName, cost, onEditClick }: SetupHeaderProps) {
    return (
        <frame key="Heading" BackgroundTransparency={1} Size={new UDim2(1, -60, 0.33, 0)}>
            <imagebutton
                key="EditButton"
                BackgroundTransparency={1}
                Image={getAsset("assets/PrinterNameEdit.png")}
                ImageTransparency={0.2}
                LayoutOrder={2}
                Size={new UDim2(0.6, 0, 0.6, 0)}
                Event={{
                    Activated: onEditClick
                }}
            >
                <uiaspectratioconstraint />
            </imagebutton>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalFlex={Enum.UIFlexAlignment.Fill}
                Padding={new UDim(0, 15)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <textbox
                key="NameLabel"
                Active={false}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                ClearTextOnFocus={false}
                FontFace={RobotoSlabBold}
                LayoutOrder={-5}
                Selectable={false}
                Size={new UDim2(0, 0, 0.8, 0)}
                Text={setupName}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextEditable={false}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <frame
                    AnchorPoint={new Vector2(0, 1)}
                    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                    BackgroundTransparency={0.8}
                    BorderSizePixel={0}
                    Position={new UDim2(0, 0, 1, 0)}
                    Size={new UDim2(1, 6, 0, 2)}
                />
            </textbox>
            <textlabel
                key="CostLabel"
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={5}
                Size={new UDim2(0, 0, 0.8, 0)}
                Text={cost}
                TextColor3={Color3.fromRGB(170, 255, 127)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Right}
            >
                <uistroke Thickness={2} />
                <uitextsizeconstraint MaxTextSize={22} />
            </textlabel>
        </frame>
    );
}

export default SetupHeader;
