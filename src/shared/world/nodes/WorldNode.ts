import { CollectionService } from "@rbxts/services";
import eat from "shared/hamster/eat";

export default class WorldNode<T extends Instance = Instance> {
    readonly INSTANCES = new Set<T>();

    constructor(
        public tag: string,
        private onRegister?: (instance: T) => void,
        private onUnregister?: (instance: T) => void,
    ) {
        CollectionService.GetTagged(tag).forEach((instance) => this.registerInstance(instance as T));
        const addedConnection = CollectionService.GetInstanceAddedSignal(tag).Connect((instance) => {
            this.registerInstance(instance as T);
        });
        const removedConnection = CollectionService.GetInstanceRemovedSignal(tag).Connect((instance) => {
            this.unregisterInstance(instance as T);
        });
        eat(() => {
            addedConnection.Disconnect();
            removedConnection.Disconnect();
            table.clear(this);
        });
    }

    private registerInstance(instance: T) {
        this.onRegister?.(instance);
        this.INSTANCES.add(instance);
        instance.AncestryChanged.Connect(() => {
            if (instance.Parent === undefined) {
                this.unregisterInstance(instance);
            }
        });
    }

    private unregisterInstance(instance: T) {
        this.onUnregister?.(instance);
        this.INSTANCES.delete(instance);
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
        const startTime = tick();
        let warned = false;
        while (instance === undefined) {
            task.wait();
            instance = this.getInstance();

            const elapsed = tick() - startTime;
            if (timeout) {
                if (elapsed > timeout) {
                    throw `Timed out waiting for instance with tag ${this.tag}`;
                }
            } else {
                if (elapsed > 10 || !warned) {
                    warn(`Waiting for instance with tag ${this.tag}...`);
                    warned = true;
                }
            }
        }
        return instance;
    }
}
