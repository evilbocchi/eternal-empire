import { OnStart, Service } from "@flamework/core";
import { OnPlayerJoined } from "server/services/PlayerJoinService";
import { Fletchette, RemoteProperty, RemoteSignal } from "@antivivi/fletchette";
import { DataService, PlayerProfileTemplate } from "./serverdata/DataService";

declare global {
    interface FletchetteCanisters {
        SettingsCanister: typeof SettingsCanister
    }
    type Settings = typeof PlayerProfileTemplate.settings
}

const SettingsCanister = Fletchette.createCanister("SettingsCanister", {
    settings: new RemoteProperty<typeof PlayerProfileTemplate.settings>(PlayerProfileTemplate.settings),
    setSetting: new RemoteSignal<<T extends keyof (typeof PlayerProfileTemplate.settings)>(setting: T, value: typeof PlayerProfileTemplate.settings[T]) => void>(),
    setHotkey: new RemoteSignal<(name: string, key: number) => void>()
});

@Service()
export class SettingsService implements OnStart, OnPlayerJoined {

    constructor(private dataService: DataService) {

    }

    onPlayerJoined(player: Player) {
        const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
        if (playerProfile !== undefined) {
            SettingsCanister.settings.setFor(player, playerProfile.Data.settings);
        }
    }

    onStart() {
        SettingsCanister.setHotkey.connect((player, name, key) => {
            const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
            if (playerProfile === undefined) {
                error("Player profile not loaded");
            }
            playerProfile.Data.settings.hotkeys.set(name, key);
            SettingsCanister.settings.setFor(player, playerProfile.Data.settings);
        });
        SettingsCanister.setSetting.connect((player, setting, value) => {
            const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
            if (playerProfile === undefined) {
                error("Player profile not loaded");
            }
            (playerProfile.Data.settings as {[key: string]: unknown})[setting] = value;
            SettingsCanister.settings.setFor(player, playerProfile.Data.settings);
        });
    }
}