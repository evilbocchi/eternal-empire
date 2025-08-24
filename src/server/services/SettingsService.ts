/**
 * @fileoverview Handles player settings and hotkey management.
 *
 * This service is responsible for:
 * - Loading and syncing player settings on join
 * - Listening for setting and hotkey changes from the client
 * - Updating player profiles and broadcasting new settings
 *
 * SettingsService ensures that player preferences are loaded, updated, and kept in sync
 * between the server and client, providing a consistent experience for all users.
 *
 * @since 1.0.0
 */
import { OnInit, Service } from "@flamework/core";
import { OnPlayerJoined } from "server/services/ModdingService";
import Packets from "shared/Packets";
import DataService from "server/services/data/DataService";

/**
 * Service for managing player settings and hotkeys.
 * Loads settings on player join and listens for updates from the client.
 */
@Service()
export default class SettingsService implements OnInit, OnPlayerJoined {

    /**
     * Constructs the SettingsService with required dependencies.
     */
    constructor(private dataService: DataService) {

    }

    /**
     * Loads and sends player settings to the client when they join.
     * @param player The player who joined
     */
    onPlayerJoined(player: Player) {
        const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
        if (playerProfile !== undefined) {
            Packets.settings.setFor(player, playerProfile.Data.settings);
        }
    }

    /**
     * Initializes the SettingsService, setting up listeners for setting and hotkey changes.
     */
    onInit() {
        Packets.setHotkey.listen((player, name, key) => {
            const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
            if (playerProfile === undefined) {
                error("Player profile not loaded");
            }
            playerProfile.Data.settings.hotkeys[name] = key;
            Packets.settings.setFor(player, playerProfile.Data.settings);
        });
        Packets.setSetting.listen((player, setting, value) => {
            const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
            if (playerProfile === undefined) {
                error("Player profile not loaded");
            }
            (playerProfile.Data.settings as { [key: string]: unknown; })[setting] = value;
            Packets.settings.setFor(player, playerProfile.Data.settings);
        });
    }
}