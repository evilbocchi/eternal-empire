import { OnInit, Service } from "@flamework/core";
import { OnPlayerJoined } from "server/services/ModdingService";
import Packets from "shared/Packets";
import { DataService } from "./serverdata/DataService";


@Service()
export class SettingsService implements OnInit, OnPlayerJoined {

    constructor(private dataService: DataService) {

    }

    onPlayerJoined(player: Player) {
        const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
        if (playerProfile !== undefined) {
            Packets.settings.setFor(player, playerProfile.Data.settings);
        }
    }

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