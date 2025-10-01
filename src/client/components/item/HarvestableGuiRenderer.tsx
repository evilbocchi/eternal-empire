import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import HarvestableGui from "client/components/item/HarvestableGui";
import { observeCharacter } from "client/constants";
import { AREAS } from "shared/world/Area";
import HARVESTABLES from "shared/world/harvestable/Harvestable";

export default function HarvestableGuiRenderer({ overrideModels }: { overrideModels?: PVInstance[] }) {
    const [enabled, setEnabled] = useState(false);

    const harvestableModels =
        overrideModels ??
        useMemo(() => {
            const models = new Array<Instance>();
            for (const [, area] of pairs(AREAS)) {
                const folder = area.worldNode.getInstance()?.FindFirstChild("Harvestable");
                if (folder === undefined) continue;
                for (const child of folder.GetChildren()) {
                    if (child.IsA("PVInstance") && HARVESTABLES[child.Name as HarvestableId] !== undefined) {
                        models.push(child);
                    }
                }
            }
            return models;
        }, []);

    useEffect(() => {
        let childAddedConnection: RBXScriptConnection | undefined;
        let childRemovedConnection: RBXScriptConnection | undefined;

        const cleanup = observeCharacter((character: Model) => {
            childAddedConnection?.Disconnect();
            childRemovedConnection?.Disconnect();
            childAddedConnection = character.ChildAdded.Connect((child) => {
                if (child.IsA("Tool")) {
                    setEnabled(true);
                }
            });
            childRemovedConnection = character.ChildRemoved.Connect((child) => {
                if (child.IsA("Tool")) {
                    setEnabled(false);
                }
            });
        });

        return () => {
            childAddedConnection?.Disconnect();
            childRemovedConnection?.Disconnect();
            cleanup();
        };
    }, []);

    return (
        <Fragment>
            {harvestableModels?.map((model) => (
                <HarvestableGui enabled={enabled} model={model as PVInstance} />
            ))}
        </Fragment>
    );
}
