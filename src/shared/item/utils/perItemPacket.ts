import { RequestPacket, SignalPacket } from "@rbxts/fletchette";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import eat from "shared/hamster/eat";

type SignalOrRequestPacket<T extends Callback = Callback> =
    ReturnType<T> extends void ? SignalPacket<T> : RequestPacket<Parameters<T>, ReturnType<T>, T>;

function isRequestPacket(packet: SignalOrRequestPacket): packet is RequestPacket<unknown[], unknown, Callback> {
    return packet.className === "RequestPacket";
}

/**
 * Creates a packet that can send and receive messages tied to specific item placements.
 * This allows for item-specific communication between the server and clients.
 * @param packet The packet to wrap for per-item communication.
 * @returns The wrapped packet with per-item methods.
 */
export default function perItemPacket<Args extends unknown[], Return>(
    packet: SignalOrRequestPacket<(placementId: string, ...args: Args) => Return | undefined>,
) {
    const isRequest = isRequestPacket(packet);
    const clientHandlers = new Map<string, (...args: Args) => Return | undefined>();
    const serverHandlers = new Map<string, (player: Player, ...args: Args) => Return | undefined>();

    if (IS_SERVER || IS_EDIT) {
        const connection = packet.fromClient((player: Player, placementId: string, ...args: Args) => {
            const handler = serverHandlers.get(placementId);
            if (handler !== undefined) {
                return handler(player, ...args);
            }
        });
        if (connection !== undefined) {
            eat(connection, "Disconnect");
        }
    }

    if (!IS_SERVER || IS_EDIT) {
        const connection = packet.fromServer((placementId: string, ...args: Args) => {
            const handler = clientHandlers.get(placementId);
            if (handler !== undefined) {
                return handler(...args);
            }
        });
        if (connection !== undefined) {
            eat(connection, "Disconnect");
        }
    }

    return {
        toAllClients: (model: Model, ...args: Args) => {
            if (isRequest) {
                throw "Cannot use toAllClients with a RequestPacket. Use toClient instead.";
            }
            packet.toAllClients(model.Name, ...args);
        },
        toClient: (model: Model, player: Player, ...args: Args): Return | undefined => {
            return packet.toClient(player, model.Name, ...args) as Return | undefined;
        },
        toServer: (model: Model, ...args: Args): Return | undefined => {
            return packet.toServer(model.Name, ...args) as Return | undefined;
        },
        fromServer: (model: Model, handler: (...args: Args) => Return) => {
            clientHandlers.set(model.Name, handler);
            model.Destroying.Once(() => {
                clientHandlers.delete(model.Name);
            });
        },
        fromClient: (model: Model, handler: (player: Player, ...args: Args) => Return) => {
            serverHandlers.set(model.Name, handler);
            model.Destroying.Once(() => {
                serverHandlers.delete(model.Name);
            });
        },
        packet,
    };
}

/**
 * Creates a property-like interface for a per-item packet, allowing setting and observing values tied to specific item placements.
 * @param signal The signal packet used to send updates.
 * @param request The request packet used to fetch the current value.
 * @returns An object with `set` and `observe` methods for managing the property.
 */
export function perItemProperty<T>(
    signal: SignalPacket<(placementId: string, value: T) => void>,
    request: SignalOrRequestPacket<(placementId: string) => T | undefined>,
) {
    const perItemSignal = perItemPacket(signal);
    const values = new Map<string, T>();

    // Hijack the request packet
    if (IS_SERVER || IS_EDIT) {
        request.fromClient((_, placementId) => {
            return values.get(placementId);
        });
    }

    return {
        set: (model: Model, value: T) => {
            const placementId = model.Name;
            values.set(placementId, value);
            perItemSignal.toAllClients(model, value);
            model.Destroying.Once(() => {
                values.delete(placementId);
            });
        },
        observe: (model: Model, handler: (value: T) => void) => {
            perItemSignal.fromServer(model, handler);
            const initial = request.toServer(model.Name);
            if (initial !== undefined) {
                handler(initial);
            }
        },
    };
}
