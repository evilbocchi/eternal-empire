import Signal from "@antivivi/lemon-signal";
import { Modding } from "@flamework/core";
import { createBinarySerializer, Serializer } from "@rbxts/flamework-binary-serializer";
import { SerializerMetadata } from "@rbxts/flamework-binary-serializer/out/metadata";
import { Players, RunService } from "@rbxts/services";
import PacketStorage from "shared/network/PacketStorage";

class PropertySignalPacket<T> {
    readonly id: string;
    remoteEvent: RemoteEvent;
    serializer: Serializer<T>;

    constructor(id: string, isUnreliable?: boolean, meta?: Modding.Many<SerializerMetadata<T>>) {
        this.id = id;
        this.serializer = createBinarySerializer<T>(meta);
        this.remoteEvent = PacketStorage.getSignalRemote(id, isUnreliable);
    }

    fire(player: Player, value: T) {
        const serialized = this.serializer.serialize(value);
        this.remoteEvent!.FireClient(player, serialized.buffer, serialized.blobs);
    }

    fireAll(value: T) {
        const serialized = this.serializer.serialize(value);
        this.remoteEvent!.FireAllClients(serialized.buffer, serialized.blobs);
    }


    /** client function */
    connect(handler: (value: T) => void) {
        return this.remoteEvent!.OnClientEvent.Connect((buffer, blobs) => handler(this.serializer.deserialize(buffer, blobs)));
    }

    /** server function */
    listen(handler: (player: Player, value: T) => void) {
        this.remoteEvent!.OnServerEvent.Connect((player, buffer, blobs) => handler(player, this.serializer.deserialize(buffer as buffer, blobs as defined[])));
    }
}

class PropertyPacket<T> {

    signalPacket: PropertySignalPacket<T>;
    value!: T;
    /** client-only */
    changed!: Signal<(value: T) => void>;
    perPlayer?: Map<Player, T | undefined>;
    playerRemoving?: RBXScriptConnection;
    
    constructor(id: string, initialValue?: T, isUnreliable?: boolean, meta?: Modding.Many<SerializerMetadata<T>>) {
        this.signalPacket = new PropertySignalPacket<T>(id, isUnreliable === true, meta);
        if (initialValue !== undefined)
            this.value = initialValue;

        if (RunService.IsServer()) {
            this.signalPacket.remoteEvent.SetAttribute("RemoteProperty", true);
            this.perPlayer = new Map();
            this.playerRemoving = Players.PlayerRemoving.Connect((player) => this.perPlayer!.delete(player));
            
            this.signalPacket.remoteEvent.OnServerEvent.Connect((player) => {
                let result = this.getFor(player);
                if (result === undefined) {
                    while (result === undefined) {
                        task.wait();
                        result = this.getFor(player);
                    }
                }
                this.signalPacket.fire(player, result);
            });
        }
        else {
            this.changed = new Signal();
            this.signalPacket.connect((value) => {
                const changed = value !== this.value;
                this.value = value;
                if (changed === true) {
                    this.changed.fire(value);
                }
            });
            this.signalPacket.remoteEvent.FireServer();
        }
    }

    set(value: T) {
        this.value = value;
        this.perPlayer!.clear();
        this.signalPacket.fireAll(value);
    }

    setTop(value: T) {
        this.value = value;
        for (const player of Players.GetPlayers()) {
            if (this.perPlayer!.get(player) === undefined) {
                this.signalPacket.fire(player, value as T);
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
            this.perPlayer!.set(player, value);
        }
        this.signalPacket.fire(player, value as T);
    }

    setForList(players: Player[], value: T) {
        for (const player of players) {
            this.setFor(player, value);
        }
    }

    clearFor(player: Player) {
        this.perPlayer!.set(player, undefined);
        this.signalPacket.fire(player, this.value);
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
        const playerVal = this.perPlayer!.get(player);
        return playerVal === undefined ? this.value : playerVal;
    }

    observe(handler: (value: T) => void) {
        task.spawn(() => {
            while (task.wait()) {
                if (this.value !== undefined)
                    break;
            }
            handler(this.value);
        });
        return this.changed.connect((value) => handler(value));
    }
}

export = PropertyPacket;