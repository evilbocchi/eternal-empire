import React from "@rbxts/react";
import UpgradeOption from "client/ui/components/upgrade/UpgradeOption";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

interface UpgradeOptionsPanelProps {
    upgrades: Array<NamedUpgrade>;
    upgradeAmounts: Map<string, number>;
    selectedUpgradeId?: string;
    onSelectUpgrade: (upgradeId: string) => void;
}

export const UpgradeOptionsPanel: React.FC<UpgradeOptionsPanelProps> = ({
    upgrades,
    upgradeAmounts,
    selectedUpgradeId,
    onSelectUpgrade,
}) => {
    return (
        <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
            <uipadding
                PaddingBottom={new UDim(0, 25)}
                PaddingLeft={new UDim(0, 25)}
                PaddingRight={new UDim(0, 25)}
                PaddingTop={new UDim(0, 25)}
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
};
