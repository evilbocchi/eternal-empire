import React, { Fragment, JSX } from "@rbxts/react";
import UpgradeBoardGui from "client/components/item/upgrade/UpgradeBoardGui";
import useTaggedItemModels from "client/components/world/useTaggedItemModels";

export default function UpgradeBoardRenderer() {
    const models = useTaggedItemModels("UpgradeBoard");

    const upgradeBoardGuis = new Array<JSX.Element>();
    for (const [model, item] of models) {
        const upgradeBoard = item.findTrait("UpgradeBoard");
        if (!upgradeBoard) return;

        const optionsContainer = model.FindFirstChild("UpgradeOptionsPart");
        const actionsContainer = model.FindFirstChild("UpgradeActionsPart");
        if (!optionsContainer || !actionsContainer) return;
        optionsContainer.AddTag("Unhoverable");
        actionsContainer.AddTag("Unhoverable");

        upgradeBoardGuis.push(
            <UpgradeBoardGui
                upgrades={upgradeBoard.upgrades}
                model={model}
                optionsContainer={optionsContainer}
                actionsContainer={actionsContainer}
            />,
        );
    }

    return <Fragment>{upgradeBoardGuis}</Fragment>;
}
