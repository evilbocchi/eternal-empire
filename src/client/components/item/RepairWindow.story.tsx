import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import RepairWindow, { RepairManager } from "client/components/item/RepairWindow";
import useVisibility from "client/hooks/useVisibility";
import TheFirstConveyor from "shared/items/negative/tfd/TheFirstConveyor";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useVisibility("Repair", props.controls.visible);

        useEffect(() => {
            Packets.placedItems.set(
                new Map([
                    [
                        "TestPlacementId",
                        {
                            item: TheFirstConveyor.id,
                            posX: 0,
                            posY: 0,
                            posZ: 0,
                            rotX: 0,
                            rotY: 0,
                            rotZ: 0,
                        },
                    ],
                ]),
            );
            RepairManager.item = TheFirstConveyor;
            RepairManager.model = undefined;
            RepairManager.placementId = "TestPlacementId";
            RepairManager.modelInfo = undefined;
            RepairManager.updated.fire();

            Packets.repairItem.fromClient(() => {
                Packets.itemRepairCompleted.toAllClients("TestPlacementId");
                return true;
            });
        }, []);

        return <RepairWindow />;
    },
);
