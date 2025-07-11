import { OnStart, Service } from "@flamework/core";
import { Profile } from "@rbxts/profileservice/globals";
import { DataService, EmpireProfileTemplate } from "server/services/serverdata/DataService";
import { AREAS } from "shared/constants";
import { Fletchette, RemoteSignal } from "@antivivi/fletchette";

declare global {
    interface FletchetteCanisters {
        UnlockedAreasCanister: typeof UnlockedAreasCanister;
    }
}

export const UnlockedAreasCanister = Fletchette.createCanister("UnlockedAreasCanister", {
    areaUnlocked: new RemoteSignal<(area: keyof (typeof AREAS)) => void>(),
});

@Service()
export class UnlockedAreasService implements OnStart {

    constructor(private dataService: DataService) {

    }

    getUnlockedAreas() {
        return this.dataService.empireProfile?.Data.unlockedAreas;
    }

    setUnlockedAreas(unlockedAreas: Set<keyof (typeof AREAS)>) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data.unlockedAreas = unlockedAreas;
        }
    }

    unlockArea(area: keyof (typeof AREAS)) {
        const areas = this.getUnlockedAreas();
        if (areas === undefined) {
            return false;
        }
        this.setUnlockedAreas(areas.add(area));
        AREAS[area].unlocked.Value = true;
        UnlockedAreasCanister.areaUnlocked.fireAll(area);
        return true;
    }

    lockArea(area: keyof (typeof AREAS)) {
        const areas = this.getUnlockedAreas();
        if (areas === undefined) {
            return false;
        }
        areas.delete(area);
        this.setUnlockedAreas(areas);
        AREAS[area].unlocked.Value = false;
        return true;
    }

    onStart() {
        const profileChanged = (profile: Profile<typeof EmpireProfileTemplate>) => {
            const unlockedAreas = profile.Data.unlockedAreas;
            for (const [id, area] of pairs(AREAS)) {
                area.unlocked.Value = unlockedAreas.has(id);
            }
        }
        if (this.dataService.empireProfile !== undefined) {
            profileChanged(this.dataService.empireProfile);
        }
        this.dataService.empireProfileLoaded.connect((profile) => profileChanged(profile));
    }
}