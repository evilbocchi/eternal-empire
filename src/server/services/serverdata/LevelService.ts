//!native
//!optimize 2

import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { getMaxXp } from "shared/constants";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

@Service()
export class LevelService implements OnInit {

    levelChanged = new Signal<(level: number) => void>();
    respected = new Signal<(player: Player) => void>();

    constructor(private dataService: DataService, private upgradeBoardService: UpgradeBoardService) {

    }

    setLevel(level: number) {
        this.dataService.empireData.level = level;
        Packets.level.set(level);
        Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        this.levelChanged.fire(level);
    }

    getXp() {
        return this.dataService.empireData.xp;
    }

    setXp(xp: number) {
        const level = this.dataService.empireData.level;
        const maxXp = getMaxXp(level);
        if (xp >= maxXp) {
            this.setLevel(level + 1);
            this.setXp(xp - maxXp);
        }
        else {
            this.dataService.empireData.xp = xp;
            Packets.xp.set(xp);
        }
    }

    getTotalLevelPoints() {
        return math.floor(this.dataService.empireData.level / 4);
    }

    getRemainingLevelPoints() {
        const totalLP = this.getTotalLevelPoints();
        const upgrades = this.dataService.empireData.upgrades;
        return totalLP
            - (upgrades.get(NamedUpgrades.Stone.id) ?? 0)
            - (upgrades.get(NamedUpgrades.WhiteGem.id) ?? 0)
            - (upgrades.get(NamedUpgrades.Crystal.id) ?? 0);
    }

    onInit() {
        Packets.level.set(this.dataService.empireData.level);
        Packets.xp.set(this.dataService.empireData.xp);
        Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        // Packets.respec.connect((player) => {
        //     if (!this.dataService.checkPermLevel(player, "purchase")) {
        //         return false;
        //     }
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.Stone.id, 0);
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.WhiteGem.id, 0);
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.Crystal.id, 0);
        //     this.respected.fire(player);
        //     Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        // });
        Packets.getUpgrade.onInvoke((player, upgradeId, amount) => {
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }
            const remainingLevelPoints = this.getRemainingLevelPoints();
            if (remainingLevelPoints === undefined || remainingLevelPoints < amount) {
                return false;
            }
            if (NamedUpgrades.Stone.id !== upgradeId && NamedUpgrades.WhiteGem.id !== upgradeId && NamedUpgrades.Crystal.id !== upgradeId) {
                return false;
            }
            this.upgradeBoardService.setUpgradeAmount(upgradeId, this.upgradeBoardService.getUpgradeAmount(upgradeId) + amount);
            Packets.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
            return true;
        });
    }
}