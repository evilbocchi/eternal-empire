import { SignalPacket } from "@rbxts/fletchette";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import eat from "shared/hamster/eat";

/**
 * Creates a packet that can send and receive messages tied to specific item placements.
 * This allows for item-specific communication between the server and clients.
 * @param signal The signal packet to wrap for per-item communication.
 * @returns The wrapped packet with per-item methods.
 */
export default function perItemPacket<Args extends unknown[]>(
    signal: SignalPacket<(placementId: string, ...args: Args) => void>,
) {
    const clientHandlers = new Map<string, (...args: Args) => void>();
    const serverHandlers = new Map<string, (player: Player, ...args: Args) => void>();

    if (IS_SERVER || IS_EDIT) {
        const connection = signal.fromClient((player: Player, placementId: string, ...args: Args) => {
            const handler = serverHandlers.get(placementId);
            if (handler !== undefined) {
                handler(player, ...args);
            }
        });
        eat(connection, "Disconnect");
    }

    if (!IS_SERVER || IS_EDIT) {
        const connection = signal.fromServer((placementId: string, ...args: Args) => {
            const handler = clientHandlers.get(placementId);
            if (handler !== undefined) {
                handler(...args);
            }
        });
        eat(connection, "Disconnect");
    }

    return {
        toAllClients: (model: Model, ...args: Args) => {
            signal.toAllClients(model.Name, ...args);
        },
        toClient: (model: Model, player: Player, ...args: Args) => {
            signal.toClient(player, model.Name, ...args);
        },
        toServer: (model: Model, ...args: Args) => {
            signal.toServer(model.Name, ...args);
        },
        fromServer: (model: Model, handler: (...args: Args) => void) => {
            clientHandlers.set(model.Name, handler);
            model.Destroying.Once(() => {
                clientHandlers.delete(model.Name);
            });
        },
        fromClient: (model: Model, handler: (player: Player, ...args: Args) => void) => {
            serverHandlers.set(model.Name, handler);
            model.Destroying.Once(() => {
                serverHandlers.delete(model.Name);
            });
        },
    };
}
