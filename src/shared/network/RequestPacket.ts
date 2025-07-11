import { Modding } from "@flamework/core";
import { createBinarySerializer, Serializer, SerializerMetadata } from "@rbxts/flamework-binary-serializer";
import PacketStorage from "shared/network/PacketStorage";

class RequestPacket<V, B, T extends (...args: Parameters<V>) => B> {
    readonly id: string;
    remoteFunction: RemoteFunction;
    serializer: Serializer<Parameters<T>>;

    constructor(id: string, meta?: Modding.Many<SerializerMetadata<Parameters<T>>>) {
        this.id = id;
        this.serializer = createBinarySerializer<Parameters<T>>(meta);
        this.remoteFunction = PacketStorage.getRequestRemote(id);
    }

    /** client function */
    invoke(...args: Parameters<T>): B {
        const serialized = this.serializer.serialize(args);
        return this.remoteFunction!.InvokeServer(serialized.buffer, serialized.blobs);
    }

    /** server function */
    query(player: Player, ...args: Parameters<T>): B {
        const serialized = this.serializer.serialize(args);
        return this.remoteFunction!.InvokeClient(player, serialized.buffer, serialized.blobs) as B;
    }

    /** client function */
    onQuery(handler: (...args: Parameters<T>) => B) {
        this.remoteFunction!.OnClientInvoke = (buffer, blobs) => handler(...this.serializer.deserialize(buffer, blobs));
    }

    /** server function */
    onInvoke(handler: (player: Player, ...args: Parameters<T>) => B) {
        this.remoteFunction!.OnServerInvoke = (player, buffer, blobs) => handler(player, ...this.serializer.deserialize(buffer as buffer, blobs as defined[]));
    }
}

export = RequestPacket;