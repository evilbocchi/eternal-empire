import { OnStart, Service } from "@flamework/core";
import { DataService, PlayerProfileTemplate } from "./serverdata/DataService";
import { Players } from "@rbxts/services";
import { Fletchette, RemoteProperty, RemoteSignal } from "shared/utils/fletchette";

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
export class SettingsService implements OnStart {

    constructor(private dataService: DataService) {

    }

    onStart() {
        const onPlayerAdded = (player: Player) => {
            const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
            if (playerProfile !== undefined) {
                SettingsCanister.settings.setFor(player, playerProfile.Data.settings);
            }
        };
        Players.PlayerAdded.Connect((player) => onPlayerAdded(player));
        for (const player of Players.GetPlayers()) {
            onPlayerAdded(player);
        }
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