import { Players } from "@rbxts/services";
import RemoteSignal from "./RemoteSignal";

class RemoteProperty<T> {

    remoteSignal: RemoteSignal<(value: T) => void>;
    value: T;
    perPlayer: Map<Player, T | undefined>;
    playerRemoving: RBXScriptConnection;

    constructor(initialValue: T, isReliable?: boolean) {
        this.remoteSignal = new RemoteSignal<(value: T) => void>(isReliable);
        this.remoteSignal.remoteEvent.SetAttribute("RemoteProperty", true);
        this.value = initialValue;
        this.perPlayer = new Map<Player, T | undefined>();
        this.playerRemoving = Players.PlayerRemoving.Connect((player) => this.perPlayer.delete(player));
        this.remoteSignal.connect((player) => this.remoteSignal.fire(player, this.getFor(player)));
    }

    static is<T>(obj: object | RemoteProperty<T>): obj is RemoteProperty<T> {
        return getmetatable(obj) === RemoteProperty;
    }

    set(value: T) {
        this.value = value;
        this.perPlayer.clear();
        this.remoteSignal.fireAll(value);
    }

    setTop(value: T) {
        this.value = value;
        for (const player of Players.GetPlayers()) {
            if (this.perPlayer.get(player) === undefined) {
                this.remoteSignal.fire(player, value);
            }
        }
    }

    setFilter(predicate: (player: Player) => boolean, value: T) {
        for (const player of Players.GetPlayers()) {
            if (predicate(player)) {
                this.setFor(player, value);
            }
        }
    }

    setFor(player: Player, value: T) {
        if (player.Parent !== undefined) {
            this.perPlayer.set(player, value);
        }
        this.remoteSignal.fire(player, value);
    }

    setForList(players: Player[], value: T) {
        for (const player of players) {
            this.setFor(player, value);
        }
    }

    clearFor(player: Player) {
        this.perPlayer.set(player, undefined);
        this.remoteSignal.fire(player, this.value);
    }

    clearForList(players: Player[]) {
        for (const player of players) {
            this.clearFor(player);
        }
    }

    clearFilter(predicate: (player: Player) => boolean) {
        for (const player of Players.GetPlayers()) {
            if (predicate(player)) {
                this.clearFor(player);
            }
        }
    }

    get() {
        return this.value;
    }

    getFor(player: Player) {
        const playerVal = this.perPlayer.get(player);
        return playerVal === undefined ? this.value : playerVal;
    }

    destroy() {
        this.remoteSignal.destroy();
        this.playerRemoving.Disconnect();
    }
}

export = RemoteProperty;