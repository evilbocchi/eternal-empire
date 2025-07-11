import { Modding } from "@flamework/core";
import { createBinarySerializer, Serializer, SerializerMetadata } from "@rbxts/flamework-binary-serializer";
import PacketStorage from "shared/network/PacketStorage";

class SignalPacket<T> {
    readonly id: string;
    remoteEvent: RemoteEvent;
    serializer: Serializer<Parameters<T>>;

    constructor(id: string, isUnreliable?: boolean, meta?: Modding.Many<SerializerMetadata<Parameters<T>>>) {
        this.id = id;
        this.serializer = createBinarySerializer<Parameters<T>>(meta);
        this.remoteEvent = PacketStorage.getSignalRemote(id, isUnreliable);
    }

    fire(player: Player, ...args: Parameters<T>) {
        const serialized = this.serializer.serialize(args);
        this.remoteEvent!.FireClient(player, serialized.buffer, serialized.blobs);
    }

    fireAll(...args: Parameters<T>) {
        const serialized = this.serializer.serialize(args);
        this.remoteEvent!.FireAllClients(serialized.buffer, serialized.blobs);
    }

    inform(...args: Parameters<T>) {
        const serialized = this.serializer.serialize(args);
        this.remoteEvent!.FireServer(serialized.buffer, serialized.blobs);
    }

    /** client function */
    connect(handler: (...args: Parameters<T>) => void) {
        return this.remoteEvent!.OnClientEvent.Connect((buffer, blobs) => handler(...this.serializer.deserialize(buffer, blobs)));
    }

    /** server function */
    listen(handler: (player: Player, ...args: Parameters<T>) => void) {
        this.remoteEvent!.OnServerEvent.Connect((player, buffer, blobs) => handler(player, ...this.serializer.deserialize(buffer as buffer, blobs as defined[])));
    }
}

export = SignalPacket;