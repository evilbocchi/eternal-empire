import React from "@rbxts/react";
import { RobotoMonoBold } from "shared/asset/GameFonts";
import { getAsset } from "shared/asset/AssetMap";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

/**
 * Pagination controls component for log navigation
 */
export default function PaginationControls({
    currentPage,
    totalPages,
    onPreviousPage,
    onNextPage,
}: PaginationControlsProps) {
    const canGoBack = currentPage > 1;
    const canGoForward = currentPage < totalPages;

    return (
        <frame
            AnchorPoint={new Vector2(0.5, 1)}
            AutomaticSize={Enum.AutomaticSize.X}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 1, -5)}
            Size={new UDim2(0, 0, 0, 20)}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 25)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {/* Previous page button */}
            <frame
                BackgroundTransparency={1}
                LayoutOrder={0}
                Selectable={canGoBack}
                Size={new UDim2(0, 30, 1, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
            >
                <imagebutton
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Dropdown.png")}
                    ImageTransparency={canGoBack ? 0 : 0.5}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Rotation={90}
                    ScaleType={Enum.ScaleType.Fit}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    Event={{
                        Activated: canGoBack ? onPreviousPage : undefined,
                    }}
                />
            </frame>

            {/* Page label */}
            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                LayoutOrder={1}
                Size={new UDim2(0, 0, 1, 0)}
                Text={`Page ${currentPage}${totalPages > 0 ? ` of ${totalPages}` : ""}`}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={16}
                TextWrapped={true}
            >
                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
            </textlabel>

            {/* Next page button */}
            <frame
                BackgroundTransparency={1}
                LayoutOrder={2}
                Selectable={canGoForward}
                Size={new UDim2(0, 30, 1, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
            >
                <imagebutton
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Dropdown.png")}
                    ImageTransparency={canGoForward ? 0 : 0.5}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Rotation={270}
                    ScaleType={Enum.ScaleType.Fit}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, 0)}
                    Event={{
                        Activated: canGoForward ? onNextPage : undefined,
                    }}
                />
            </frame>
        </frame>
    );
}
