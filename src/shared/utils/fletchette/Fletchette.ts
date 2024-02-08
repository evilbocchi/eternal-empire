import { ReplicatedStorage } from "@rbxts/services";
import ClientRemoteFunc from "./ClientRemoteFunc";
import ClientRemoteProperty from "./ClientRemoteProperty";
import ClientRemoteSignal from "./ClientRemoteSignal";
import RemoteFunc from "./RemoteFunc";
import RemoteProperty from "./RemoteProperty";
import RemoteSignal from "./RemoteSignal";

declare global {
    interface FletchetteCanisters {}
}

type MapValueToClient<T> = T extends RemoteFunc<infer U>
	? ClientRemoteFunc<U>
	: T extends RemoteProperty<infer U>
	? ClientRemoteProperty<U>
	: T extends RemoteSignal<infer U>
	? ClientRemoteSignal<U>
	: never;

type MapContainerToClient<T> = { [K in keyof T]: MapValueToClient<T[K]> };
/**
 * All Fletchette functions and utilities
 */
namespace Fletchette {
    /**
     * Retrieves Flechette's working folder. If it does not exist, it will be automatically created and returned.
     * 
     * @returns Folder containing all canister remote events and functions
     */
    export function getFlechetteFolder() {
        let fletchetteFolder = ReplicatedStorage.FindFirstChild("FletchetteCanisters");
        if (fletchetteFolder === undefined) {
            fletchetteFolder = new Instance("Folder");
            fletchetteFolder.Name = "FletchetteCanisters";
            fletchetteFolder.Parent = ReplicatedStorage;
        }
        return fletchetteFolder;
    }

    /**
     * Create a new Canister, containing all remotes for a specific scope. Multiple canisters can be created and compartmentalised, but no two canisters
     * can hold the same name, otherwise returning the Canister that was first created.
     * 
     * @param name Name of the Canister. Used to retrieve remotes from the client.
     * @param container The dictionary containing all remotes in the Canister.
     * @returns The `container` parameter. Use this to register Canisters using TypeScript's type declarations. 
     * ```
     * declare global {
     *     interface FletchetteCanisters {
     *          CanisterName: typeof CanisterName
     *     }
     * }
     * ```
     */
    export function createCanister<T extends {[name: string]: RemoteSignal | RemoteFunc | RemoteProperty<unknown>}>(name: string, container: T): T {
        const flechetteFolder = Fletchette.getFlechetteFolder();
        const cached = flechetteFolder.FindFirstChild(name);
        if (cached !== undefined) {
            return (cached as unknown) as T;
        }
        const canisterFolder = new Instance("Folder");
        canisterFolder.Name = name;
        canisterFolder.Parent = flechetteFolder;

        for (const [name, remote] of pairs(container)) {
            if (RemoteSignal.is(remote)) {
                remote.remoteEvent.Name = name as string;
                remote.remoteEvent.Parent = canisterFolder;
            }
            else if (RemoteFunc.is(remote)) {
                remote.remoteFunction.Name = name as string;
                remote.remoteFunction.Parent = canisterFolder;
            }
            else if (RemoteProperty.is(remote)) {
                remote.remoteSignal.remoteEvent.Name = name as string;
                remote.remoteSignal.remoteEvent.Parent = canisterFolder;
            }

        }
        return container;
    }

    /**
     * Retrieves the named Canister. This is a client-only function.
     * 
     * @param name Name of the Canister
     * @returns Canister
     */
    export function getCanister<T extends keyof FletchetteCanisters>(name: T): MapContainerToClient<FletchetteCanisters[T]> {
        const canisterFolder = Fletchette.getFlechetteFolder().WaitForChild(name, 10);
        if (canisterFolder === undefined)
            error("Cannot find canister " + name);
        const container: {[name: string]: ClientRemoteFunc | ClientRemoteProperty<unknown> | ClientRemoteSignal} = {};
        for (const remote of canisterFolder.GetChildren()) {
            const n = remote.Name;
            if (remote.IsA("RemoteEvent")) {
                container[n] = remote.GetAttribute("RemoteProperty") === true ? new ClientRemoteProperty(remote) : new ClientRemoteSignal(remote);
            }
            else if (remote.IsA("RemoteFunction")) {
                container[n] = new ClientRemoteFunc(remote);
            }
        }
        return container as MapContainerToClient<FletchetteCanisters[T]>;
    }
}

export = Fletchette;