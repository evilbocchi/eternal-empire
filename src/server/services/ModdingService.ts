import { Modding, OnInit, Service } from "@flamework/core";
import { Players } from "@rbxts/services";

export interface OnPlayerJoined {
	onPlayerJoined(player: Player): void;
}

@Service()
export class ModdingService implements OnInit {
	onInit() {
		const listeners = new Set<OnPlayerJoined>();
		Modding.onListenerAdded<OnPlayerJoined>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnPlayerJoined>((object) => listeners.delete(object));

		Players.PlayerAdded.Connect((player) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onPlayerJoined(player));
			}
		})

		for (const player of Players.GetPlayers()) {
			for (const listener of listeners) {
				task.spawn(() => listener.onPlayerJoined(player));
			}
		}
	}
}