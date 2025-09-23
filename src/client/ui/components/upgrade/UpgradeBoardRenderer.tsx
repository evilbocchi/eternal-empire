import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { CollectionService } from "@rbxts/services";
import UpgradeBoardGui from "client/ui/components/upgrade/UpgradeBoardGui";
import Items from "shared/items/Items";

export default function UpgradeBoardRenderer() {
    const [upgradeBoardGuis, setUpgradeBoardGuis] = useState<Array<JSX.Element>>([]);

    useEffect(() => {
        const elements = new Set<JSX.Element>();
        const registerUpgradeBoard = (model: Instance) => {
            if (!model.IsA("Model")) return;
            const itemId = model.GetAttribute("ItemId") as string | undefined;
            if (!itemId) return;
            const item = Items.getItem(itemId);
            if (!item) return;
            const upgradeBoard = item.findTrait("UpgradeBoard");
            if (!upgradeBoard) return;

            const optionsContainer = model.FindFirstChild("UpgradeOptionsPart");
            const actionsContainer = model.FindFirstChild("UpgradeActionsPart");
            if (!optionsContainer || !actionsContainer) return;

            const upgradeBoardGui = (
                <UpgradeBoardGui
                    upgrades={upgradeBoard.upgrades}
                    model={model}
                    optionsContainer={optionsContainer}
                    actionsContainer={actionsContainer}
                />
            );
            elements.add(upgradeBoardGui);
            model.Destroying.Once(() => {
                elements.delete(upgradeBoardGui);
                setUpgradeBoardGuis([...elements]);
            });
        };
        CollectionService.GetTagged("UpgradeBoard").forEach(registerUpgradeBoard);
        const connection = CollectionService.GetInstanceAddedSignal("UpgradeBoard").Connect((instance) => {
            registerUpgradeBoard(instance);
            setUpgradeBoardGuis([...elements]);
        });

        return () => connection.Disconnect();
    }, []);

    return <Fragment>{upgradeBoardGuis}</Fragment>;
}
