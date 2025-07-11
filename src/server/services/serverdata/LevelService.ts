import { OnStart, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { getMaxXp } from "shared/constants";
import NamedUpgrade from "shared/item/NamedUpgrade";
import { Fletchette, RemoteFunc, RemoteProperty, Signal } from "@antivivi/fletchette";

declare global {
    interface FletchetteCanisters {
        LevelCanister: typeof LevelCanister;
    }
}

export const LevelCanister = Fletchette.createCanister("LevelCanister", {
    remainingLevelPoints: new RemoteProperty<number>(-1),
    level: new RemoteProperty<number>(-1),
    xp: new RemoteProperty<number>(-1),
    getUpgrade: new RemoteFunc<(upgradeId: string, amount: number) => boolean>(),
});

@Service()
export class LevelService implements OnStart {

    levelChanged = new Signal<(level: number) => void>();
    respected = new Signal<(player: Player) => void>();

    constructor(private dataService: DataService, private upgradeBoardService: UpgradeBoardService) {

    }

    getLevel() {
        return this.dataService.empireProfile?.Data.level;
    }

    setLevel(level: number) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data.level = level;
            LevelCanister.level.set(level);
            LevelCanister.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
            this.levelChanged.fire(level);
        }
    }

    getXp() {
        return this.dataService.empireProfile?.Data.xp;
    }

    setXp(xp: number) {
        if (this.dataService.empireProfile !== undefined) {
            const level = this.dataService.empireProfile.Data.level;
            const maxXp = getMaxXp(level);
            if (xp >= maxXp) {
                this.setLevel(level + 1);
                this.setXp(xp - maxXp);
            }
            else {
                this.dataService.empireProfile.Data.xp = xp;
                LevelCanister.xp.set(xp);
            }
        }
    }

    getTotalLevelPoints() {
        const level = this.getLevel();
        if (level === undefined) {
            return undefined;
        }
        return math.floor(level / 4);
    }

    getRemainingLevelPoints() {
        const totalLP = this.getTotalLevelPoints();
        if (totalLP === undefined) {
            return undefined;
        }
        const upgrades = this.upgradeBoardService.getAmountPerUpgrade();
        return totalLP - (upgrades[NamedUpgrade.Stone.id] ?? 0) - (upgrades[NamedUpgrade.WhiteGem.id] ?? 0) - (upgrades[NamedUpgrade.Crystal.id] ?? 0);
    }
    
    onStart() {
        if (this.dataService.empireProfile !== undefined) {
            LevelCanister.level.set(this.dataService.empireProfile.Data.level);
            LevelCanister.xp.set(this.dataService.empireProfile.Data.xp);
            LevelCanister.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        }
        this.dataService.empireProfileLoaded.connect((profile) => {
            LevelCanister.level.set(profile.Data.level);
            LevelCanister.xp.set(profile.Data.xp);
            LevelCanister.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        });
        // LevelCanister.respec.connect((player) => {
        //     if (!this.dataService.checkPermLevel(player, "purchase")) {
        //         return false;
        //     }
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.Stone.id, 0);
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.WhiteGem.id, 0);
        //     this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.Crystal.id, 0);
        //     this.respected.fire(player);
        //     LevelCanister.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
        // });
        LevelCanister.getUpgrade.onInvoke((player, upgradeId, amount) => {
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }
            const remainingLevelPoints = this.getRemainingLevelPoints();
            if (remainingLevelPoints === undefined || remainingLevelPoints < amount) {
                return false;
            }
            if (NamedUpgrade.Stone.id !== upgradeId && NamedUpgrade.WhiteGem.id !== upgradeId && NamedUpgrade.Crystal.id !== upgradeId) {
                return false;
            }
            this.upgradeBoardService.setUpgradeAmount(upgradeId, this.upgradeBoardService.getUpgradeAmount(upgradeId) + amount);
            LevelCanister.remainingLevelPoints.set(this.getRemainingLevelPoints()!);
            return true;
        });
    }
}