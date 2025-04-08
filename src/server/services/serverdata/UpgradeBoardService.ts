//!native
//!optimize 2

import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import { Players, StarterPlayer } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import Sandbox from "shared/Sandbox";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

@Service()
export class UpgradeBoardService implements OnInit {

    readonly upgrades: Map<string, number>;
    upgradesChanged = new Signal<(upgrades: Map<string, number>) => void>();
    upgradeBought = new Signal<(player: Player, upgradeId: string, to: number, from: number) => void>();

    constructor(private dataService: DataService, private currencyService: CurrencyService) {
        this.upgrades = this.dataService.empireData.upgrades;
    }

    setAmountPerUpgrade(data: Map<string, number>) {
        this.upgrades.clear();
        data.forEach((value, key) => this.upgrades.set(key, value));
        this.upgradesChanged.fire(data);
        Packets.upgrades.set(data);
    }

    getUpgradeAmount(upgradeId: string) {
        return this.upgrades.get(upgradeId) ?? 0;
    }

    setUpgradeAmount(upgradeId: string, amount: number) {
        const upgrades = this.upgrades;
        upgrades.set(upgradeId, amount);
        this.upgradesChanged.fire(upgrades);
        Packets.upgrades.set(upgrades);
    }

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

    onInit() {
        Packets.upgrades.set(this.upgrades);
        Packets.buyUpgrade.onInvoke((player, upgradeId, to) => {
            if (!this.dataService.checkPermLevel(player, "purchase") || to === undefined) {
                return false;
            }
            return this.buyUpgrade(upgradeId, to, player);
        });

        if (Sandbox.getEnabled()) {
            return;
        }

        const wsUpgs = NamedUpgrades.getUpgrades("WalkSpeed");
        this.upgradesChanged.connect((data) => {
            let ws = 16;
            wsUpgs.forEach((value, key) => ws = value.apply(ws, data.get(key)!));
            StarterPlayer.CharacterWalkSpeed = ws;

            for (const player of Players.GetPlayers()) {
                if (player.Character !== undefined) {
                    const hum = player.Character.FindFirstChildOfClass("Humanoid");
                    if (hum !== undefined)
                        hum.WalkSpeed = StarterPlayer.CharacterWalkSpeed;
                }
            }
        });
        this.upgradesChanged.fire(this.upgrades);
    }
}