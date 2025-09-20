import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { BasicAreaBoardGui } from "client/ui/components/area/AreaBoardGui";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

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
    for (const area of [AREAS.BarrenIslands, AREAS.SlamoVillage]) {
        const counts = dropletCounts.get(area.id);
        elements.push(
            <BasicAreaBoardGui
                key={area.id}
                area={area}
                dropletCount={counts?.current}
                dropletLimit={counts?.max}
                placedItemsText={tostring(placedItemsPerArea.get(area.id)) ?? "0"}
            />,
        );
    }

    return <Fragment>{elements}</Fragment>;
}
