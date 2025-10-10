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
import { OnStart, Service } from "@flamework/core";
import { OnPlayerAdded } from "server/services/ModdingService";
import { IS_EDIT } from "shared/Context";
import { PlayerProfileManager } from "shared/data/profile/ProfileManager";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

/**
 * Service for managing player settings and hotkeys.
 * Loads settings on player join and listens for updates from the client.
 */
@Service()
export default class SettingsService implements OnStart, OnPlayerAdded {
    /**
     * Loads and sends player settings to the client when they join.
     * @param player The player who joined
     */
    onPlayerAdded(player: Player) {
        const playerProfile = PlayerProfileManager.load(player?.UserId ?? 0);
        if (playerProfile !== undefined) {
            let loadedSettings: Settings;
            if (IS_EDIT) {
                // For convenience (aka so you can listen to your music without the game music blasting at you)
                loadedSettings = table.clone(playerProfile.Data.settings);
                loadedSettings.Music = false;
            } else {
                loadedSettings = playerProfile.Data.settings;
            }

            Packets.settings.setFor(player, loadedSettings);
        }
    }

    /**
     * Initializes the SettingsService, setting up listeners for setting and hotkey changes.
     */
    onStart() {
        const hotkeyConnection = Packets.setHotkey.fromClient((player, name, key) => {
            if (player === undefined && !IS_EDIT) return;
            const playerProfile = PlayerProfileManager.load(player?.UserId ?? 0);
            if (playerProfile === undefined) {
                throw "Player profile not loaded";
            }
            playerProfile.Data.settings.hotkeys[name] = key;

            if (player === undefined) {
                Packets.settings.set(playerProfile.Data.settings);
                return;
            }
            Packets.settings.setFor(player, playerProfile.Data.settings);
        });

        const settingConnection = Packets.setSetting.fromClient((player, setting, value) => {
            if (player === undefined && !IS_EDIT) return;
            const playerProfile = PlayerProfileManager.load(player?.UserId ?? 0);
            if (playerProfile === undefined) {
                throw "Player profile not loaded";
            }
            (playerProfile.Data.settings as { [key: string]: unknown })[setting] = value;

            if (player === undefined) {
                Packets.settings.set(playerProfile.Data.settings);
                return;
            }
            Packets.settings.setFor(player, playerProfile.Data.settings);
        });

        eat(hotkeyConnection, "Disconnect");
        eat(settingConnection, "Disconnect");
    }
}
