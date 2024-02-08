import { OnStart, Service } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { DataService } from "server/services/serverdata/DataService";
import { Fletchette, RemoteProperty } from "shared/utils/fletchette";

declare global {
    interface FletchetteCanisters {
        PlaytimeCanister: typeof PlaytimeCanister
    }
}

const PlaytimeCanister = Fletchette.createCanister("PlaytimeCanister", {
    longestSessionTime: new RemoteProperty<number>(0, false),
    sessionTime: new RemoteProperty<number>(0, false),
    empirePlaytime: new RemoteProperty<number>(0, false),
    playerPlaytime: new RemoteProperty<number>(0, false),
});

@Service()
export class PlaytimeService implements OnStart {

    constructor(private dataService: DataService) {

    }

    getPlaytime() {
        return this.dataService.empireProfile?.Data.playtime ?? 0;
    }

    setPlaytime(value: number) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data.playtime = value;
            PlaytimeCanister.empirePlaytime.set(value);
        }
    }

    onStart() {
        task.spawn(() => {
            this.dataService.empireProfileLoaded.Once((profile) => PlaytimeCanister.longestSessionTime.set(profile.Data.longestSession));
            if (this.dataService.empireProfile !== undefined) {
                PlaytimeCanister.longestSessionTime.set(this.dataService.empireProfile.Data.longestSession);
            }
    
            let t = 0;
            RunService.Heartbeat.Connect((dt) => {
                t += dt;
                if (t > 1) {
                    this.setPlaytime(this.getPlaytime() + t);
                    const st = PlaytimeCanister.sessionTime.get() + t;
                    PlaytimeCanister.sessionTime.set(st);
                    if (this.dataService.empireProfile !== undefined &&  this.dataService.empireProfile.Data.longestSession < st) {
                        this.dataService.empireProfile.Data.longestSession = st;
                        PlaytimeCanister.longestSessionTime.set(st);
                    }
                    t = 0;
                }
            });
        });
    }
}