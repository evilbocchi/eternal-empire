import { OnInit, Service } from "@flamework/core";
import { BadgeService, Players } from "@rbxts/services";

@Service()
export class BadgesService implements OnInit {


    onPlayerAdded(player: Player) {
        BadgeService.AwardBadge(player.UserId, 3498765777753358);
    }

    onInit() {
        Players.PlayerAdded.Connect((player) => this.onPlayerAdded(player));
        for (const player of Players.GetPlayers()) {
            this.onPlayerAdded(player);
        } 
    }
}