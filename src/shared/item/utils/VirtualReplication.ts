import { DataType } from "@rbxts/flamework-binary-serializer";
import { request, RequestPacket, signal, SignalPacket } from "@rbxts/fletchette";
import { RunService } from "@rbxts/services";
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
        reference.set(attribute, callback);
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

    if (RunService.IsServer()) {
        const handleRequest = <T>(_: Player, placementId: string, uid: DataType.u16, attribute: string) => {
            const instance = trackedModels.get(placementId);
            if (instance === undefined) return undefined;
            const reference = trackedInstances.get(instance.get(uid)!);
            return reference?.get(attribute) as T | undefined;
        };

        requestNumberPacket.fromClient(handleRequest);
    } else {
        const handleSend = <T>(placementId: string, uid: DataType.u16, attribute: string, value: T) => {
            const modelReference = trackedModels.get(placementId);
            if (modelReference === undefined) return;
            const instance = modelReference.get(uid);
            if (instance === undefined) return;
            const reference = trackedInstances.get(instance);
            if (reference === undefined) return;

            const callback = reference?.get(attribute);
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
 * VirtualCollision.handleDropletTouched(model, lavaPart, (droplet) => {
 *     // Process the droplet (e.g., smelt it)
 * });
 *
 * // Client-side: Listen for droplet touches on a furnace's lava part
 * VirtualCollision.listenForDropletTouches(model, lavaPart);
 * ```
 */
export namespace VirtualCollision {
    const dropletTouchedPacket = signal<(placementId: string, partUid: DataType.u16, spawnId: string) => void>(true);

    /**
     * Registers a callback to be invoked when a droplet touches the specified part.
     * @param model The item model containing the part.
     * @param part The part to monitor for droplet touches.
     * @param callback The callback to invoke when a droplet touches the part.
     */
    export function handleDropletTouched(
        model: Model,
        part: BasePart,
        callback: (part: BasePart, droplet: BasePart) => void,
    ) {
        const [reference] = trackInstance(model, part);
        reference.set("DropletTouched", callback);
    }

    /**
     * Sets up client-side listening for droplet touches on the specified part.
     * @param model The item model containing the part.
     * @param part The part to monitor for droplet touches.
     */
    export function listenForDropletTouches(model: Model, part: BasePart) {
        const partUid = uid(part);
        part.Touched.Connect((otherPart) => {
            if (!otherPart.HasTag("Droplet")) return;
            dropletTouchedPacket.toServer(model.Name, partUid, otherPart.Name);
        });
    }

    if (RunService.IsServer()) {
        const connection = dropletTouchedPacket.fromClient((_, placementId, partUid, spawnId) => {
            const modelReference = trackedModels.get(placementId);
            if (modelReference === undefined) return;
            const part = modelReference.get(partUid) as BasePart | undefined;
            if (part === undefined) return;
            const reference = trackedInstances.get(part);
            if (reference === undefined) return;
            const callback = reference?.get("DropletTouched");
            if (callback !== undefined) {
                const droplet = Droplet.MODEL_PER_SPAWN_ID.get(spawnId);
                if (droplet !== undefined) {
                    (callback as (droplet: BasePart) => void)(droplet);
                }
            }
        });
        eat(connection, "Disconnect");
    }
}
