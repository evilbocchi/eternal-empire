import { getAllInstanceInfo } from "@antivivi/vrldk";
import { DataType } from "@rbxts/flamework-binary-serializer";
import { request, RequestPacket, signal, SignalPacket } from "@rbxts/fletchette";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import eat from "shared/hamster/eat";
import Droplet from "shared/item/Droplet";
import type Item from "shared/item/Item";

function uid(instance: Instance) {
    return instance.GetAttribute("uid") as number;
}

const trackedModels = new Map<string, Map<number, Instance>>();
const trackedInstances = new Map<Instance, Map<string, unknown>>();

function trackModel(model: Model) {
    const name = model.Name;

    const existing = trackedModels.get(name);
    if (existing !== undefined) return existing;

    const reference = new Map<number, Instance>();
    trackedModels.set(name, reference);
    model.Destroying.Once(() => {
        for (const [, instance] of reference) {
            trackedInstances.delete(instance);
        }
        trackedModels.delete(name);
    });
    return reference;
}

function trackInstance(model: Model, instance: Instance) {
    const instanceUid = uid(instance);

    const existing = trackedInstances.get(instance);
    if (existing !== undefined) return $tuple(existing, instanceUid);

    const modelReference = trackModel(model);
    modelReference.set(instanceUid, instance);

    const reference = new Map<string, unknown>();
    trackedInstances.set(instance, reference);
    return $tuple(reference, instanceUid);
}

/**
 * A synchronization utility for setting and observing instance attributes in {@link Item} models.
 *
 * This is meant to be a replacement for `Instance:SetAttribute` and `Instance:GetAttribute`, since item
 * models are manually replicated to clients and thus attributes are not automatically replicated.
 *
 * @example
 * ```ts
 * // Server-side: Set a "Speed" attribute on a conveyor part
 * VirtualAttribute.setNumber(model, conveyorPart, "Speed", speed);
 *
 * // Client-side: Observe changes to the "Speed" attribute on a conveyor part
 * VirtualAttribute.observeNumber(model, conveyorPart, "Speed", (speed) => {
 *     updateSpeed(speed);
 * });
 * ```
 */
export namespace VirtualAttribute {
    const sendNumberPacket =
        signal<(placementId: string, uid: DataType.u16, attribute: string, value: number) => void>();
    const requestNumberPacket =
        request<(placementId: string, uid: DataType.u16, attribute: string) => number | undefined>();

    function set<T>(
        model: Model,
        instance: Instance,
        attribute: string,
        value: T,
        packet: SignalPacket<(placementId: string, uid: DataType.u16, attribute: string, value: T) => void>,
    ) {
        const [reference, instanceUid] = trackInstance(model, instance);
        reference.set(attribute, value);
        packet.toAllClients(model.Name, instanceUid, attribute, value);
    }

    function observe<T>(
        model: Model,
        instance: Instance,
        attribute: string,
        callback: (value: T) => void,
        packet: RequestPacket<
            [placementId: string, uid: DataType.u16, attribute: string],
            T | undefined,
            (placementId: string, uid: DataType.u16, attribute: string) => T | undefined
        >,
    ) {
        const [reference, instanceUid] = trackInstance(model, instance);
        const initial = packet.toServer(model.Name, instanceUid, attribute);
        if (initial !== undefined) callback(initial);
        if (IS_EDIT) {
            reference.set("client_" + attribute, callback); // Prevent clashing with server callbacks
        } else {
            reference.set(attribute, callback);
        }
    }

    /** Sends a number update to all clients */
    export function setNumber(model: Model, instance: Instance, attribute: string, value: number) {
        set(model, instance, attribute, value, sendNumberPacket);
    }

    /** Observes a number attribute for changes from the server */
    export function observeNumber(
        model: Model,
        instance: Instance,
        attribute: string,
        callback: (value: number) => void,
    ) {
        observe(model, instance, attribute, callback, requestNumberPacket);
    }

    if (IS_SERVER || IS_EDIT) {
        const handleRequest = <T>(_: Player, placementId: string, uid: DataType.u16, attribute: string) => {
            const instance = trackedModels.get(placementId);
            if (instance === undefined) return undefined;
            const reference = trackedInstances.get(instance.get(uid)!);
            return reference?.get(attribute) as T | undefined;
        };

        requestNumberPacket.fromClient(handleRequest);
    }

    if (!IS_SERVER || IS_EDIT) {
        const handleSend = <T>(placementId: string, uid: DataType.u16, attribute: string, value: T) => {
            const modelReference = trackedModels.get(placementId);
            if (modelReference === undefined) return;
            const instance = modelReference.get(uid);
            if (instance === undefined) return;
            const reference = trackedInstances.get(instance);
            if (reference === undefined) return;

            const callback = reference?.get(IS_EDIT ? "client_" + attribute : attribute);
            if (callback !== undefined) {
                (callback as (value: T) => void)(value);
            }
        };

        eat(sendNumberPacket.fromServer(handleSend), "Disconnect");
    }
}

/**
 * A utility for handling collision events between item models and droplets.
 *
 * This is meant to be a replacement for `BasePart.Touched` events, since item models are manually
 * replicated to clients and thus collision events are not automatically replicated.
 *
 * @example
 * ```ts
 * // Server-side: Handle droplet touches on a furnace's lava part
 * VirtualCollision.onDropletTouched(model, lavaPart, (droplet, dropletInfo) => {
 *     // Handle the droplet touch event
 * });
 *
 * // Client-side: Listen for droplet touches on a furnace's lava part
 * VirtualCollision.toServerDropletTouched(model, lavaPart);
 * ```
 */
export namespace VirtualCollision {
    const dropletTouchedPacket = signal<(placementId: string, partUid: DataType.u16, spawnId: string) => void>(true);
    const requestToListenPacket = signal<(placementId: string, partUids: Array<DataType.u16>) => void>();
    const findListeningPacket = request<() => Map<string, Set<DataType.u16>>>();

    const listeningPlacements = new Map<string, Set<DataType.u16>>();
    const pendingListeningPlacements = new Map<string, Set<DataType.u16>>();

    const BATCH_FLUSH_INTERVAL = 1;
    let batchFlushScheduled = false;

    function scheduleBatchFlush() {
        if (batchFlushScheduled) return;
        batchFlushScheduled = true;
        task.delay(BATCH_FLUSH_INTERVAL, () => {
            batchFlushScheduled = false;
            flushPendingBroadcasts();
            if (pendingListeningPlacements.size() > 0) {
                scheduleBatchFlush();
            }
        });
    }

    function ensurePlacementSet(placementId: string) {
        let set = listeningPlacements.get(placementId);
        if (set !== undefined) return set;
        set = new Set<DataType.u16>();
        listeningPlacements.set(placementId, set);
        return set;
    }

    function addPlacementListener(placementId: string, partUid: DataType.u16) {
        const set = ensurePlacementSet(placementId);
        if (set.has(partUid)) return false;
        set.add(partUid);

        let pendingSet = pendingListeningPlacements.get(placementId);
        if (pendingSet === undefined) {
            pendingSet = new Set<DataType.u16>();
            pendingListeningPlacements.set(placementId, pendingSet);
        }
        pendingSet.add(partUid);
        scheduleBatchFlush();

        return true;
    }

    function removePlacementListener(placementId: string, partUid: DataType.u16) {
        const set = listeningPlacements.get(placementId);
        if (set === undefined) return;
        set.delete(partUid);
        if (set.size() === 0) {
            listeningPlacements.delete(placementId);
        }

        const pendingSet = pendingListeningPlacements.get(placementId);
        if (pendingSet !== undefined) {
            pendingSet.delete(partUid);
            if (pendingSet.size() === 0) {
                pendingListeningPlacements.delete(placementId);
            }
        }
    }

    function flushPendingBroadcasts() {
        if (pendingListeningPlacements.size() === 0) return;

        const payloads = new Array<[string, Array<DataType.u16>]>();
        for (const [placementId, uidSet] of pendingListeningPlacements) {
            if (uidSet.size() === 0) continue;
            const uids = new Array<DataType.u16>();
            let hasValues = false;
            for (const uid of uidSet) {
                uids.push(uid);
                hasValues = true;
            }
            if (!hasValues) continue;
            payloads.push([placementId, uids]);
        }

        pendingListeningPlacements.clear();

        for (const [placementId, partUids] of payloads) {
            requestToListenPacket.toAllClients(placementId, partUids);
        }
    }

    /**
     * Registers a callback to be invoked when a droplet touches the specified part.
     * This does not register the callback on the client; use {@link toServerDropletTouched} for that.
     * @param model The item model containing the part.
     * @param part The part to monitor for droplet touches.
     * @param callback The function to call when a droplet touches the part.
     */
    export function onDropletTouched(
        model: Model,
        part: BasePart,
        callback: (droplet: BasePart, dropletInfo: InstanceInfo) => void,
    ) {
        const instanceInfo = getAllInstanceInfo(part);
        instanceInfo.DropletTouched = callback;
        const [reference, partUid] = trackInstance(model, part);
        if (callback !== undefined) {
            reference.set("DropletTouched", callback);
            addPlacementListener(model.Name, partUid);

            eat(
                part.Destroying.Connect(() => {
                    reference.delete("DropletTouched");
                    removePlacementListener(model.Name, partUid);
                }),
                "Disconnect",
            );
        }
    }

    if (IS_SERVER || IS_EDIT) {
        const connection = dropletTouchedPacket.fromClient((_, placementId, partUid, spawnId) => {
            const modelReference = trackedModels.get(placementId);
            if (modelReference === undefined) return;

            const part = modelReference.get(partUid) as BasePart | undefined;
            if (part === undefined) return;

            const reference = trackedInstances.get(part);
            if (reference === undefined) return;

            const callback = reference?.get("DropletTouched");
            if (callback === undefined) return;

            const droplet = Droplet.MODEL_PER_SPAWN_ID.get(spawnId);
            if (droplet === undefined) return;

            const dropletInfo = Droplet.SPAWNED_DROPLETS.get(droplet);
            if (dropletInfo === undefined) return;

            (callback as (droplet: BasePart, dropletInfo: InstanceInfo) => void)(droplet, dropletInfo);
        });
        eat(connection, "Disconnect");

        findListeningPacket.fromClient(() => {
            const result = new Map<string, Set<DataType.u16>>();
            for (const [placementId, uidSet] of listeningPlacements) {
                const copy = new Set<DataType.u16>();
                for (const uid of uidSet) {
                    copy.add(uid);
                }
                result.set(placementId, copy);
            }
            for (const [placementId, uidSet] of pendingListeningPlacements) {
                if (uidSet.size() === 0) continue;
                let existing = result.get(placementId);
                if (existing === undefined) {
                    existing = new Set<DataType.u16>();
                    result.set(placementId, existing);
                }
                for (const uid of uidSet) {
                    existing.add(uid);
                }
            }
            return result;
        });
    }

    if (!IS_SERVER || IS_EDIT) {
        const DROPLET_CONNECTION_KEY = "__DropletTouchedConnection";

        const clientPlacementParts = new Map<string, Map<DataType.u16, BasePart>>();

        const getModelForPlacement = (placementId: string) => {
            const existing = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
            if (existing !== undefined && existing.IsA("Model")) return existing;
            const awaited = PLACED_ITEMS_FOLDER.WaitForChild(placementId, 1);
            return awaited !== undefined && awaited.IsA("Model") ? awaited : undefined;
        };

        const resolvePart = (placementId: string, partUid: DataType.u16) => {
            let placementMap = clientPlacementParts.get(placementId);
            if (placementMap !== undefined) {
                const cached = placementMap.get(partUid);
                if (cached !== undefined) return cached;
            }

            const model = getModelForPlacement(placementId);
            if (model === undefined) return undefined;

            if (placementMap === undefined) {
                placementMap = new Map<DataType.u16, BasePart>();
                clientPlacementParts.set(placementId, placementMap);
            }

            for (const descendant of model.GetDescendants()) {
                if (!descendant.IsA("BasePart")) continue;
                const descendantUid = uid(descendant);
                if (descendantUid === undefined) continue;
                placementMap.set(descendantUid as DataType.u16, descendant);
            }

            return placementMap.get(partUid);
        };

        const handleRequest = (placementId: string, partUid: DataType.u16) => {
            const part = resolvePart(placementId, partUid);
            if (part === undefined) return;
            const model = part.Parent;
            if (model === undefined || !model.IsA("Model")) return;

            const [reference] = trackInstance(model, part);
            if (reference.get(DROPLET_CONNECTION_KEY) !== undefined) return;

            const connection = part.Touched.Connect((otherPart) => {
                if (!otherPart.HasTag("Droplet")) return;
                dropletTouchedPacket.toServer(model.Name, partUid, otherPart.Name);
            });

            reference.set(DROPLET_CONNECTION_KEY, connection);

            eat(
                part.Destroying.Connect(() => {
                    const stored = reference.get(DROPLET_CONNECTION_KEY) as RBXScriptConnection | undefined;
                    if (stored !== undefined) {
                        stored.Disconnect();
                        reference.delete(DROPLET_CONNECTION_KEY);
                    }
                    const placementMap = clientPlacementParts.get(placementId);
                    placementMap?.delete(partUid);
                    if (placementMap !== undefined && placementMap.size() === 0) {
                        clientPlacementParts.delete(placementId);
                    }
                }),
                "Disconnect",
            );

            eat(connection, "Disconnect");
        };

        const handleRequests = (placementId: string, partUids: Array<DataType.u16>) => {
            for (const partUid of partUids) {
                handleRequest(placementId, partUid);
            }
        };

        for (const [placementId, uidSet] of findListeningPacket.toServer()) {
            const partUids = new Array<DataType.u16>();
            for (const uid of uidSet) {
                partUids.push(uid);
            }
            handleRequests(placementId, partUids);
        }

        const connection = requestToListenPacket.fromServer(handleRequests);
        eat(connection, "Disconnect");
    }
}
