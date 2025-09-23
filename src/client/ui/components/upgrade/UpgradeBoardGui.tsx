import { playSoundAtPart } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import { UpgradeActionsPanel } from "client/ui/components/upgrade/UpgradeActionsPanel";
import { UpgradeOptionsPanel } from "client/ui/components/upgrade/UpgradeOptionsPanel";
import { getSound } from "shared/asset/GameAssets";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";
import Packets from "shared/Packets";

export default function UpgradeBoardGui({
    upgrades,
    model,
    actionsContainer,
    optionsContainer,
}: {
    upgrades: NamedUpgrade[];
    model: Model;
    actionsContainer: Instance;
    optionsContainer: Instance;
}) {
    const [selectedUpgradeId, setSelectedUpgradeId] = useState<string | undefined>(undefined);
    const [upgradeAmounts, setUpgradeAmounts] = useState<Map<string, number>>(new Map());

    // Find selected upgrade object
    const selectedUpgrade = useMemo(() => {
        return selectedUpgradeId ? upgrades.find((u) => u.id === selectedUpgradeId) : undefined;
    }, [selectedUpgradeId, upgrades]);

    // Get upgrade amount for selected upgrade
    const upgradeAmount = selectedUpgradeId ? (upgradeAmounts.get(selectedUpgradeId) ?? 0) : 0;

    // Check if upgrade is maxed
    const isMaxed = selectedUpgrade?.cap !== undefined && upgradeAmount >= selectedUpgrade.cap;

    // Calculate next amounts for different purchase options
    const getNext = (amount: number, step?: number) =>
        step === undefined ? amount + 1 : amount + step - (amount % step);

    // Calculate costs for purchase options
    const costs = useMemo(() => {
        if (!selectedUpgrade) {
            return {
                buy1: "Select an upgrade!",
                buyNext: "Select an upgrade!",
                buyMax: "Select an upgrade!",
            };
        }

        if (isMaxed) {
            return {
                buy1: "MAXED",
                buyNext: "MAXED",
                buyMax: "MAXED",
            };
        }

        const buy1Cost = selectedUpgrade.getPrice(upgradeAmount + 1)?.toString() ?? "Error";
        const nextAmount = getNext(upgradeAmount, selectedUpgrade.step);
        const buyNextCost = selectedUpgrade.getPrice(upgradeAmount + 1, nextAmount)?.toString() ?? "Error";
        const buyMaxCost = selectedUpgrade.getPrice(upgradeAmount + 1, selectedUpgrade.cap)?.toString() ?? "Error";

        return {
            buy1: buy1Cost,
            buyNext: `${buyNextCost} (to ${nextAmount})`,
            buyMax: buyMaxCost,
        };
    }, [selectedUpgrade, upgradeAmount, isMaxed]);

    // Sound feedback function
    const playSound = (success: boolean) => {
        const sound = success ? getSound("UpgradeBought.mp3") : getSound("Error.mp3");
        playSoundAtPart(model.PrimaryPart, sound);
    };

    // Purchase handlers
    const handleBuy1 = () => {
        if (selectedUpgrade) {
            const success = Packets.buyUpgrade.toServer(selectedUpgrade.id, upgradeAmount + 1);
            playSound(success);
        }
    };

    const handleBuyNext = () => {
        if (selectedUpgrade) {
            const nextAmount = getNext(upgradeAmount, selectedUpgrade.step);
            const success = Packets.buyUpgrade.toServer(selectedUpgrade.id, nextAmount);
            playSound(success);
        }
    };

    const handleBuyMax = () => {
        if (selectedUpgrade?.cap !== undefined) {
            const success = Packets.buyUpgrade.toServer(selectedUpgrade.id, selectedUpgrade.cap);
            playSound(success);
        }
    };

    // Observe upgrade amounts from packets
    useEffect(() => {
        const connection = Packets.upgrades.observe((value) => {
            setUpgradeAmounts(value);
        });

        return () => connection.disconnect();
    }, []);

    return (
        <Fragment>
            <surfacegui
                Adornee={optionsContainer as BasePart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
                ResetOnSpawn={false}
            >
                <UpgradeOptionsPanel
                    upgrades={upgrades}
                    upgradeAmounts={upgradeAmounts}
                    selectedUpgradeId={selectedUpgradeId}
                    onSelectUpgrade={setSelectedUpgradeId}
                />
            </surfacegui>

            <surfacegui
                Adornee={actionsContainer as BasePart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
                ResetOnSpawn={false}
            >
                <UpgradeActionsPanel
                    selectedUpgrade={selectedUpgrade}
                    upgradeAmount={upgradeAmount}
                    costs={costs}
                    isMaxed={isMaxed}
                    onBuy1={handleBuy1}
                    onBuyNext={handleBuyNext}
                    onBuyMax={handleBuyMax}
                />
            </surfacegui>
        </Fragment>
    );
}
