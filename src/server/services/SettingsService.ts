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
import { OnPlayerAdded } from "server/services/ModdingService";
import { PlayerProfileManager } from "shared/data/profile/ProfileManager";
import Packets from "shared/Packets";

/**
 * Service for managing player settings and hotkeys.
 * Loads settings on player join and listens for updates from the client.
 */
@Service()
export default class SettingsService implements OnInit, OnPlayerAdded {
    /**
     * Loads and sends player settings to the client when they join.
     * @param player The player who joined
     */
    onPlayerAdded(player: Player) {
        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile !== undefined) {
            Packets.settings.setFor(player, playerProfile.Data.settings);
        }
    }

    /**
     * Initializes the SettingsService, setting up listeners for setting and hotkey changes.
     */
    onInit() {
        Packets.setHotkey.fromClient((player, name, key) => {
            const playerProfile = PlayerProfileManager.load(player.UserId);
            if (playerProfile === undefined) {
                error("Player profile not loaded");
            }
            playerProfile.Data.settings.hotkeys[name] = key;
            Packets.settings.setFor(player, playerProfile.Data.settings);
        });
        Packets.setSetting.fromClient((player, setting, value) => {
            const playerProfile = PlayerProfileManager.load(player.UserId);
            if (playerProfile === undefined) {
                error("Player profile not loaded");
            }
            (playerProfile.Data.settings as { [key: string]: unknown })[setting] = value;
            Packets.settings.setFor(player, playerProfile.Data.settings);
        });
    }
}
