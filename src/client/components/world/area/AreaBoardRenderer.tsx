import React, { Fragment, JSX, useEffect, useState } from "@rbxts/react";
import {
    EmphasizedHeaderAreaBoardGui,
    OminousAreaBoardGui,
    SereneAreaBoardGui,
    SimpleAreaBoardGui,
} from "client/components/world/area/AreaBoardGui";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

export const COLOR_SEQUENCE_PER_AREA: { [key in AreaId]?: ColorSequence } = {
    IntermittentIsles: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(170, 0, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(85, 0, 255)),
    ]),
    AbandonedRig: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 0, 170)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 0, 85)),
    ]),
    Eden: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(211, 99, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 229, 239)),
    ]),
    DespairPlantation: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(0, 0, 0)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
    ]),

    BarrenIslands: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(0, 150, 0)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(69, 112, 43)),
    ]),
    SlamoVillage: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 0)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 85, 0)),
    ]),
    SkyPavilion: new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(0, 170, 255)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(0, 85, 255)),
    ]),
};

export default function AreaBoardRenderer() {
    const [dropletCounts, setDropletCounts] = useState<Map<string, { current: number; max: number }>>(new Map());
    const [placedItemsPerArea, setPlacedItemsPerArea] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const dropletConnection = Packets.dropletCountChanged.fromServer((areaId, current, max) => {
            setDropletCounts((prev) => {
                prev.set(areaId, { current, max });
                return table.clone(prev);
            });
        });
        const placedItemsPerAreaConnection = Packets.placedItems.observe((placedItems) => {
            const counts = new Map<string, number>();
            for (const [, placedItem] of placedItems) {
                const areaId = placedItem.area;
                if (!areaId) continue;
                counts.set(areaId, (counts.get(areaId) ?? 0) + 1);
            }
            setPlacedItemsPerArea(counts);
        });
        return () => {
            dropletConnection.Disconnect();
            placedItemsPerAreaConnection.Disconnect();
        };
    }, []);

    const elements = new Array<JSX.Element>();
    for (const [id, colorSequence] of pairs(COLOR_SEQUENCE_PER_AREA)) {
        const area = AREAS[id];
        const counts = dropletCounts.get(area.id);
        const props: AreaBoardGuiProps = {
            area,
            colorSequence,
            dropletCount: counts?.current,
            dropletLimit: counts?.max,
            placedItemsText: tostring(placedItemsPerArea.get(area.id) ?? 0),
        };
        switch (id) {
            case "BarrenIslands":
            case "SlamoVillage":
            case "SkyPavilion":
                elements.push(<EmphasizedHeaderAreaBoardGui {...props} />);
                break;
            case "DespairPlantation":
                elements.push(<OminousAreaBoardGui {...props} />);
                break;
            case "Eden":
                elements.push(<SereneAreaBoardGui {...props} />);
                break;
            case "IntermittentIsles":
            case "AbandonedRig":
            default:
                elements.push(<SimpleAreaBoardGui {...props} />);
                break;
        }
    }

    return <Fragment>{elements}</Fragment>;
}
