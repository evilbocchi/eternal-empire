//!native
//!optimize 2

/**
 * @fileoverview UpgradeBoardService - Manages upgrades, their purchase, and synchronization.
 *
 * This service provides:
 * - Tracking and updating upgrade amounts
 * - Handling upgrade purchases and caps
 * - Firing signals and syncing upgrades with clients
 * - Applying upgrade effects (e.g., walk speed)
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

/**
 * Service that manages upgrades for the current empire, including purchase and effects.
 */
@Service()
export class UpgradeBoardService implements OnInit {

    /** Map of upgrade IDs to their current amounts. */
    readonly upgrades: Map<string, number>;

    /** Signal fired when upgrades change. */
    upgradesChanged = new Signal<(upgrades: Map<string, number>) => void>();

    /** Signal fired when an upgrade is bought. */
    upgradeBought = new Signal<(player: Player, upgradeId: string, to: number, from: number) => void>();

    constructor(private dataService: DataService, private currencyService: CurrencyService) {
        this.upgrades = this.dataService.empireData.upgrades;
    }

    /**
     * Sets the amount for each upgrade from a map and syncs with clients.
     * 
     * @param data Map of upgrade IDs to amounts.
     */
    setAmountPerUpgrade(data: Map<string, number>) {
        this.upgrades.clear();
        data.forEach((value, key) => this.upgrades.set(key, value));
        this.upgradesChanged.fire(data);
        Packets.upgrades.set(data);
    }

    /**
     * Gets the current amount for a specific upgrade.
     * 
     * @param upgradeId The upgrade ID.
     */
    getUpgradeAmount(upgradeId: string) {
        return this.upgrades.get(upgradeId) ?? 0;
    }

    /**
     * Sets the amount for a specific upgrade and syncs with clients.
     * 
     * @param upgradeId The upgrade ID.
     * @param amount The new amount.
     */
    setUpgradeAmount(upgradeId: string, amount: number) {
        const upgrades = this.upgrades;
        upgrades.set(upgradeId, amount);
        this.upgradesChanged.fire(upgrades);
        Packets.upgrades.set(upgrades);
    }

    /**
     * Attempts to buy an upgrade, checking caps, price, and permissions.
     * Deducts currency and updates state if successful.
     * 
     * @param upgradeId The upgrade ID.
     * @param to The target amount (optional).
     * @param player The player buying the upgrade (optional).
     * @param isFree Whether the upgrade is free (optional).
     * @returns True if the upgrade was bought, false otherwise.
     */
    buyUpgrade(upgradeId: string, to?: number, player?: Player, isFree?: boolean) {
        const upgrade = NamedUpgrades.ALL_UPGRADES.get(upgradeId);
        if (upgrade === undefined) {
            return false;
        }
        const current = this.getUpgradeAmount(upgradeId);
        if (to === undefined) {
            to = current + 1;
        }
        const cap = upgrade.cap;
        if (cap !== undefined && to > cap) {
            return false;
        }
        else if (current >= to) {
            return false;
        }
        const price = to === current + 1 ? upgrade.getPrice(to) : upgrade.getPrice(current + 1, to);
        if (price === undefined) {
            return false;
        }
        const success = this.currencyService.purchase(price, isFree);
        if (success) {
            this.setUpgradeAmount(upgradeId, to);
            if (player !== undefined) {
                this.upgradeBought.fire(player, upgradeId, to, current);
            }
        }
        return success;
    }

    /**
     * Initializes the UpgradeBoardService, sets up listeners and applies upgrade effects.
     */
    onInit() {
        Packets.upgrades.set(this.upgrades);
        Packets.buyUpgrade.onInvoke((player, upgradeId, to) => {
            if (!this.dataService.checkPermLevel(player, "purchase") || to === undefined) {
                return false;
            }
            return this.buyUpgrade(upgradeId, to, player);
        });

        const wsUpgs = NamedUpgrades.getUpgrades("WalkSpeed");
        this.upgradesChanged.connect((data) => {
            let ws = 16;
            wsUpgs.forEach((value, key) => ws = value.apply(ws, data.get(key)!));
            Workspace.SetAttribute("WalkSpeed", ws);
        });
        this.upgradesChanged.fire(this.upgrades);
    }
}