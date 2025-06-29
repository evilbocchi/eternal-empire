/**
 * @fileoverview ModdingService - Provides a listener system for player join events.
 *
 * This service allows other services to register for OnPlayerJoined events,
 * ensuring modular and extensible player join logic.
 *
 * @since 1.0.0
 */
import { Modding, OnInit, Service } from "@flamework/core";
import { Players } from "@rbxts/services";

export interface OnPlayerJoined {
    /**
     * Called when a player joins the game.
     * @param player The player who joined.
     */
    onPlayerJoined(player: Player): void;
}

@Service()
export class ModdingService implements OnInit {
    /**
     * Initializes the modding service and sets up player join listeners.
     */
    onInit() {
        const listeners = new Set<OnPlayerJoined>();
        Modding.onListenerAdded<OnPlayerJoined>((object) => listeners.add(object));
        Modding.onListenerRemoved<OnPlayerJoined>((object) => listeners.delete(object));

        Players.PlayerAdded.Connect((player) => {
            for (const listener of listeners) {
                task.spawn(() => listener.onPlayerJoined(player));
            }
        });

        for (const player of Players.GetPlayers()) {
            for (const listener of listeners) {
                task.spawn(() => listener.onPlayerJoined(player));
            }
        }
    }
}