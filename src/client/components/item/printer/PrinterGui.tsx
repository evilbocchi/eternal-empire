import React, { JSX } from "@rbxts/react";
import { OnoeNum } from "@rbxts/serikanum";
import SetupOption from "client/components/item/printer/SetupOption";
import TemplateSetup from "client/components/item/printer/TemplateSetup";
import useProperty from "client/hooks/useProperty";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Packets from "shared/Packets";

export default function PrinterGui({ adornee, areaId }: { adornee: Part; areaId: AreaId }) {
    const printedSetups = useProperty(Packets.printedSetups);

    const setups = new Array<JSX.Element>();
    for (const setup of printedSetups) {
        if (setup.area !== areaId) continue;
        const currencyBundle = new CurrencyBundle();
        for (const [currency, amount] of setup.calculatedPrice) {
            currencyBundle.set(currency, new OnoeNum(amount));
        }
        setups.push(<SetupOption setupName={setup.name} cost={currencyBundle.toString()} />);
    }

    // Generate default name for template: "Setup X" where X is the next number
    const defaultSetupName = `Setup ${printedSetups.size() + 1}`;

    return (
        <surfacegui
            Adornee={adornee}
            ClipsDescendants={false}
            LightInfluence={0.5}
            MaxDistance={200}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            ResetOnSpawn={false}
            Face={Enum.NormalId.Front}
            PixelsPerStud={50}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0.05, 0)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding
                PaddingBottom={new UDim(0, 5)}
                PaddingLeft={new UDim(0, 5)}
                PaddingRight={new UDim(0, 5)}
                PaddingTop={new UDim(0, 5)}
            />
            <scrollingframe
                Active={false}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} />
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 4)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                {setups}
                <TemplateSetup placementId={adornee.Name} defaultSetupName={defaultSetupName} />
            </scrollingframe>
        </surfacegui>
    );
}
