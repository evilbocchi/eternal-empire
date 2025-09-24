import React, { Fragment } from "@rbxts/react";
import PrinterGui from "client/ui/components/world/printer/PrinterGui";
import useTaggedItemModels from "client/ui/components/world/useTaggedItemModels";

export default function PrinterRenderer() {
    const models = useTaggedItemModels("Printer");

    const printerGuis = new Array<JSX.Element>();
    for (const [model, item] of models) {
        const printer = item.findTrait("Printer");
        if (!printer) return;

        const adornee = model.FindFirstChild("GuiPart");
        if (!adornee) return;

        const areaId = printer.area;
        if (areaId === undefined) return;

        printerGuis.push(<PrinterGui adornee={adornee as Part} areaId={areaId} />);
    }

    return <Fragment>{printerGuis}</Fragment>;
}
