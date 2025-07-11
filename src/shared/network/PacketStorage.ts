import { ReplicatedStorage, RunService } from "@rbxts/services";

namespace PacketStorage {
    export const PACKET_STORAGE = (function() {
        if (RunService.IsServer()) {
            const PacketStorage = new Instance("Folder");
            PacketStorage.Name = "PacketStorage";
            PacketStorage.Parent = ReplicatedStorage;
            return PacketStorage;
        }
        else {
            return ReplicatedStorage.WaitForChild("PacketStorage") as Folder;
        }
    })();

    export const getSignalRemote = (id: string | number, isUnreliable?: boolean) => {
        let remote: RemoteEvent;
        if (RunService.IsServer()) {
            remote = (new Instance(isUnreliable === true ? "UnreliableRemoteEvent" : "RemoteEvent") as BaseRemoteEvent) as RemoteEvent;
            remote.Name = tostring(id);
            remote.Parent = PACKET_STORAGE;
        }
        else {
            remote = PACKET_STORAGE.WaitForChild(id) as RemoteEvent;
        }
        return remote;
    }

    export const getRequestRemote = (id: string | number) => {
        let remote: RemoteFunction;
        if (RunService.IsServer()) {
            remote = new Instance("RemoteFunction");
            remote.Name = tostring(id);
            remote.Parent = PACKET_STORAGE;
        }
        else {
            remote = PACKET_STORAGE.WaitForChild(id) as RemoteFunction;
        }
        return remote;
    }
}

export = PacketStorage;