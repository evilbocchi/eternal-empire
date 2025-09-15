/**
 * @fileoverview Provides a listener system for player join events.
 *
 * This service allows other services to register for OnPlayerJoined events,
 * ensuring modular and extensible player join logic.
 *
 * @since 1.0.0
 */
import Signal from "@antivivi/lemon-signal";
import { Modding, OnInit, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Server } from "shared/item/ItemUtils";

export interface OnPlayerJoined {
    /**
     * Called when a player joins the game.
     * Also called for players already in the game when the service starts.
     * @param player The player who joined.
     */
    onPlayerJoined(player: Player): void;
}

export interface OnGameAPILoaded {
    /**
     * Called when the game API is loaded.
     * This can be used to initialize any game-related logic that depends on the API.
     */
    onGameAPILoaded(): void;
}

@Service()
export default class ModdingService implements OnInit {
    readonly gameAPILoaded = new Signal();

    private hookPlayerJoined() {
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

    private hookGameAPILoaded() {
        const listeners = new Set<OnGameAPILoaded>();
        Modding.onListenerAdded<OnGameAPILoaded>((object) => listeners.add(object));
        Modding.onListenerRemoved<OnGameAPILoaded>((object) => listeners.delete(object));
        this.gameAPILoaded.connect(() => {
            for (const listener of listeners) {
                task.spawn(() => listener.onGameAPILoaded());
            }
        });
        if (Server.ready) {
            this.gameAPILoaded.fire();
        }
    }

    /**
     * Initializes the modding service and sets up player join listeners.
     */
    onInit() {
        this.hookPlayerJoined();
        this.hookGameAPILoaded();
    }
}
