import React, { createRef, Fragment } from "@rbxts/react";
import useHotkeyWithTooltip from "client/ui/components/hotkeys/useHotkeyWithTooltip";
import DocumentManager from "client/ui/components/window/DocumentManager";
import { RobotoMonoBold } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";

interface NavigationControlsProps {
    currentPage: number;
    maxPage: number;
    currentPageName: string;
    onPageChange: (newPage: number) => void;
}

/**
 * Navigation controls for switching between currency pages/categories.
 */
export default function NavigationControls({
    currentPage,
    maxPage,
    currentPageName,
    onPageChange,
}: NavigationControlsProps) {
    const leftRef = createRef<ImageButton>();
    const rightRef = createRef<ImageButton>();
    const leftTooltipProps = useHotkeyWithTooltip({
        label: "Previous Page",
        action: () => {
            if (!DocumentManager.isVisible("Balance")) return false;
            onPageChange(currentPage - 1);
            playSound("MenuClick.mp3");
            return true;
        },
        onEnter: () => {
            leftRef.current!.ImageTransparency = 0;
        },
        onLeave: () => {
            leftRef.current!.ImageTransparency = 0.5;
        },
    });
    const rightTooltipProps = useHotkeyWithTooltip({
        label: "Next Page",
        action: () => {
            if (!DocumentManager.isVisible("Balance")) return false;
            onPageChange(currentPage + 1);
            playSound("MenuClick.mp3");
            return true;
        },
        onEnter: () => {
            rightRef.current!.ImageTransparency = 0;
        },
        onLeave: () => {
            rightRef.current!.ImageTransparency = 0.5;
        },
    });

    return (
        <Fragment>
            {/* Left Arrow */}
            <frame
                Active={true}
                BackgroundTransparency={1}
                LayoutOrder={-5}
                Selectable={true}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
            >
                <imagebutton
                    ref={leftRef}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Dropdown.png")}
                    ImageTransparency={0.5}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Rotation={90}
                    ScaleType={Enum.ScaleType.Fit}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    Event={{
                        ...leftTooltipProps.events,
                    }}
                />
            </frame>

            {/* Page Label */}
            <textlabel
                Active={true}
                AutomaticSize={Enum.AutomaticSize.X}
                AnchorPoint={new Vector2(0.5, 1)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.5, 0, 1, -5)}
                Size={new UDim2(0, 0, 1, 0)}
                Text={currentPageName}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} Transparency={0.2} />
                <uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
            </textlabel>

            {/* Right Arrow */}
            <frame
                Active={true}
                BackgroundTransparency={1}
                LayoutOrder={5}
                Selectable={true}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
            >
                <imagebutton
                    ref={rightRef}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Dropdown.png")}
                    ImageTransparency={0.5}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Rotation={270}
                    ScaleType={Enum.ScaleType.Fit}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    Event={{
                        ...rightTooltipProps.events,
                    }}
                />
            </frame>

            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </Fragment>
    );
}
