import React from "@rbxts/react";
import UpgradeOption from "client/ui/components/world/upgrade/UpgradeOption";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

export default function UpgradeOptionsPanel({
    upgrades,
    upgradeAmounts,
    selectedUpgradeId,
    onSelectUpgrade,
}: {
    upgrades: Array<NamedUpgrade>;
    upgradeAmounts: Map<string, number>;
    selectedUpgradeId?: string;
    onSelectUpgrade: (upgradeId: string) => void;
}) {
    return (
        <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
            <uipadding
                PaddingBottom={new UDim(0, 30)}
                PaddingLeft={new UDim(0, 30)}
                PaddingRight={new UDim(0, 30)}
                PaddingTop={new UDim(0, 30)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            {upgrades.map((upgrade) => {
                const amount = upgradeAmounts.get(upgrade.id) ?? 0;
                const isMaxed = upgrade.cap !== undefined && amount >= upgrade.cap;
                const isSelected = selectedUpgradeId === upgrade.id;

                return (
                    <UpgradeOption
                        key={upgrade.id}
                        upgrade={upgrade}
                        amount={amount}
                        isMaxed={isMaxed}
                        isSelected={isSelected}
                        onSelect={() => onSelectUpgrade(upgrade.id)}
                    />
                );
            })}
        </frame>
    );
}
