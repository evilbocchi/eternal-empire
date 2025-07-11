import { OnInit, Service } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { DataService } from "server/services/serverdata/DataService";
import Packets from "shared/network/Packets";
import ItemUtils from "shared/utils/ItemUtils";

@Service()
export class PlaytimeService implements OnInit {

    constructor(private dataService: DataService) {

    }

    getPlaytime() {
        return this.dataService.empireData.playtime;
    }

    setPlaytime(value: number) {
        this.dataService.empireData.playtime = value;
        Packets.empirePlaytime.set(value);
    }

    onInit() {
        Packets.longestSessionTime.set(this.dataService.empireData.longestSession);
        task.spawn(() => {
            let t = 0;
            RunService.Heartbeat.Connect((dt) => {
                t += dt;
                if (t > 1) {
                    const playtime = this.getPlaytime() + t;
                    this.setPlaytime(playtime);
                    ItemUtils.clientDroplets = playtime > 100000;
                    const st = Packets.sessionTime.get() + t;
                    Packets.sessionTime.set(st);
                    if (this.dataService.empireData.longestSession < st) {
                        this.dataService.empireData.longestSession = st;
                        Packets.longestSessionTime.set(st);
                    }
                    t = 0;
                }
            });
        });
    }
}