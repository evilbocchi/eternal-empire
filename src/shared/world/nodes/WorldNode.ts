import { CollectionService } from "@rbxts/services";
import eat from "shared/hamster/eat";

export default class WorldNode<T extends Instance = Instance> {
    readonly INSTANCES = new Set<T>();
    private addedConnection?: RBXScriptConnection;
    private removedConnection?: RBXScriptConnection;

    constructor(
        public tag: string,
        private onRegister?: (instance: T) => void,
        private onUnregister?: (instance: T) => void,
    ) {
        for (const instance of CollectionService.GetTagged(tag)) {
            this.registerInstance(instance as T);
        }
        this.addedConnection = CollectionService.GetInstanceAddedSignal(tag).Connect((instance) => {
            this.registerInstance(instance as T);
        });
        this.removedConnection = CollectionService.GetInstanceRemovedSignal(tag).Connect((instance) => {
            this.unregisterInstance(instance as T);
        });
        eat(() => this.cleanup());
    }

    private registerInstance(instance: T) {
        this.INSTANCES.add(instance);
        this.onRegister?.(instance);
        eat(
            instance.AncestryChanged.Connect(() => {
                if (instance.Parent === undefined) {
                    this.unregisterInstance(instance);
                }
            }),
        );
    }

    private unregisterInstance(instance: T) {
        this.INSTANCES.delete(instance);
        this.onUnregister?.(instance);
    }

    cleanup() {
        for (const instance of this.INSTANCES) {
            this.unregisterInstance(instance);
        }
        this.addedConnection?.Disconnect();
        this.removedConnection?.Disconnect();
    }
}

export class SingleWorldNode<T extends Instance = Instance> extends WorldNode<T> {
    originalParent?: Instance;

    constructor(tag: string, onRegister?: (instance: T) => void, onUnregister?: (instance: T) => void) {
        super(
            tag,
            (instance) => {
                this.originalParent = instance.Parent;
                onRegister?.(instance);
            },
            onUnregister,
        );
    }

    /**
     * Get the single instance registered to this node.
     * @returns The registered instance, or undefined if none exists.
     */
    getInstance(): T | undefined {
        for (const instance of this.INSTANCES) {
            return instance;
        }
        return undefined;
    }

    /**
     * Wait for the instance to be registered to this node.
     * @returns The registered instance.
     */
    waitForInstance(timeout?: number): T {
        let instance = this.getInstance();
        if (instance !== undefined) return instance;

        const startTime = os.clock();
        let warned = false;
        let exitEarly = false;
        eat(() => {
            exitEarly = true;
        });

        while (instance === undefined) {
            if (exitEarly) throw "Exited early while waiting for instance";

            task.wait();
            instance = this.getInstance();
            if (instance !== undefined) return instance;

            const elapsed = os.clock() - startTime;
            if (timeout) {
                if (elapsed > timeout) {
                    throw `Timed out waiting for instance with tag ${this.tag}`;
                }
            } else {
                if (elapsed > 10 && !warned) {
                    warn(`Waiting for instance with tag ${this.tag}...`);
                    warned = true;
                }
            }
        }

        return instance;
    }
}
