import Signal from "@antivivi/lemon-signal";
import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { LeaderstatsService } from "server/services/LeaderstatsService";
import { DataService } from "server/services/serverdata/DataService";

@Service()
export class DonationService implements OnStart {
    donatedChanged = new Signal<(player: Player, amount: number) => void>();

    constructor(private leaderstatsService: LeaderstatsService, private dataService: DataService) {
    }

    getDonated(player: Player) {
        return this.dataService.loadPlayerProfile(player.UserId, true)?.Data.donated ?? 0;
    }

    setDonated(player: Player, donated: number) {
        const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
        if (playerProfile !== undefined) {
            playerProfile.Data.donated = donated;
            this.donatedChanged.fire(player, donated);
        }
    }

    onStart() {
        const update = (player: Player, donated: number) => {
            this.leaderstatsService.setLeaderstat(player, "Donated", donated);
        };
        this.donatedChanged.connect((player, donated) => update(player, donated));
        Players.PlayerAdded.Connect((player) => update(player, this.getDonated(player)));
        for (const player of Players.GetPlayers()) {
            update(player, this.getDonated(player));
        }
    }
}