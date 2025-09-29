import { IS_EDIT } from "shared/Context";

export default class VirtualActor {
    private readonly virtualBindings = new Map<string, (...args: unknown[]) => void>();

    constructor(public actor: Actor) {}

    sendMessage(message: string, ...args: unknown[]) {
        if (IS_EDIT) {
            const callback = this.virtualBindings.get(message);
            if (callback !== undefined) {
                callback(...args);
                return;
            }
        }

        this.actor.SendMessage(message, ...args);
    }

    bindToMessage<T extends unknown[]>(message: string, callback: (...args: T) => void) {
        if (IS_EDIT) {
            this.virtualBindings.set(message, callback as (...args: unknown[]) => void);
            return {
                Disconnect: () => {
                    this.virtualBindings.delete(message);
                },
            };
        }

        return this.actor.BindToMessage(message, callback);
    }

    bindToMessageParallel<T extends unknown[]>(message: string, callback: (...args: T) => void) {
        if (IS_EDIT) {
            this.virtualBindings.set(message, callback as (...args: unknown[]) => void);
            return {
                Disconnect: () => {
                    this.virtualBindings.delete(message);
                },
            };
        }

        return this.actor.BindToMessageParallel(message, callback);
    }
}
