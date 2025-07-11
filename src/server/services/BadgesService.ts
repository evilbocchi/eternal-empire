import { Service } from "@flamework/core";
import { BadgeService } from "@rbxts/services";
import { OnPlayerJoined } from "server/services/PlayerJoinService";

@Service()
export class BadgesService implements OnPlayerJoined {
    onPlayerJoined(player: Player) {
        BadgeService.AwardBadge(player.UserId, 3498765777753358);
    }
}