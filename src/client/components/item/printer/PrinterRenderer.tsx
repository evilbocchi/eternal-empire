import React, { Fragment, JSX } from "@rbxts/react";
import PrinterGui from "client/components/item/printer/PrinterGui";
import useTaggedItemModels from "client/components/world/useTaggedItemModels";

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
