import { OnStart, Service } from "@flamework/core";
import { Players, StarterPlayer } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import NamedUpgrade from "shared/item/NamedUpgrade";
import { Fletchette, RemoteFunc, RemoteProperty, Signal } from "@antivivi/fletchette";

declare global {
    interface FletchetteCanisters {
        UpgradeBoardCanister: typeof UpgradeBoardCanister;
    }
}

const UpgradeBoardCanister = Fletchette.createCanister("UpgradeBoardCanister", {
    upgrades: new RemoteProperty<{[upgradeId: string]: number}>({}, true),
    buyUpgrade: new RemoteFunc<(upgradeId: string, to?: number) => boolean>(),
});

@Service()
export class UpgradeBoardService implements OnStart {

    upgradesChanged = new Signal<(upgrades: {[upgradeId: string]: number}) => void>();
    upgradeBought = new Signal<(player: Player, upgradeId: string, to: number, from: number) => void>();
    
    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    getAmountPerUpgrade(): {[upgradeId: string]: number} {
        return this.dataService.empireProfile?.Data.upgrades ?? {};
    }

    setAmountPerUpgrade(data: {[upgradeId: string]: number}) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data.upgrades = data;
            this.upgradesChanged.fire(data);
        }
    }

    getUpgradeAmount(upgradeId: string) {
        return this.getAmountPerUpgrade()[upgradeId] ?? 0;
    }

    setUpgradeAmount(upgradeId: string, amount: number) {
        const amountPerUpgrade = this.getAmountPerUpgrade();
        amountPerUpgrade[upgradeId] = amount;
        this.setAmountPerUpgrade(amountPerUpgrade);
        UpgradeBoardCanister.upgrades.set(amountPerUpgrade);
    }

    onStart() {
        UpgradeBoardCanister.upgrades.set(this.getAmountPerUpgrade());
        UpgradeBoardCanister.buyUpgrade.onInvoke((player, upgradeId, to) => {
            const upgrade = NamedUpgrade.getUpgrade(upgradeId);
            if (upgrade === undefined || to === undefined) {
                return false;
            }
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }
            const cap = upgrade.cap;
            if (cap !== undefined && to > cap) {
                return false;
            }
            const current = this.getUpgradeAmount(upgradeId);
            if (current >= to) {
                return false;
            }
            const price = to === current + 1 ? upgrade.getPrice(to) : upgrade.getPrice(current + 1, to);
            if (price === undefined) {
                return false;
            }
            const [success, remain] = this.currencyService.isSufficientBalance(price);
            if (success) {
                this.setUpgradeAmount(upgradeId, to);
                this.currencyService.setBalance(remain);
                this.upgradeBought.fire(player, upgradeId, to, current);
            }
            return success;
        });
        this.upgradesChanged.connect((data) => {
            StarterPlayer.CharacterWalkSpeed = 16;
            for (const [upgradeId, amount] of pairs(data)) {
                const upgrade = NamedUpgrade.getUpgrade(upgradeId as string);
                if (upgrade === undefined)
                    continue;
                const wsFormula = upgrade.walkSpeedFormula;
                if (wsFormula !== undefined) {
                    StarterPlayer.CharacterWalkSpeed = wsFormula(StarterPlayer.CharacterWalkSpeed, amount, upgrade.step);
                }
            }
            for (const player of Players.GetPlayers()) {
                if (player.Character !== undefined) {
                    const hum = player.Character.FindFirstChildOfClass("Humanoid");
                    if (hum !== undefined)
                        hum.WalkSpeed = StarterPlayer.CharacterWalkSpeed;
                }
            }
        });
        this.upgradesChanged.fire(this.getAmountPerUpgrade());
    }
}