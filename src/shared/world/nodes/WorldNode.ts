import { CollectionService } from "@rbxts/services";

export default class WorldNode<T extends Instance = Instance> {
    readonly INSTANCES = new Set<T>();

    private cleanup?: () => void;

    constructor(
        public tag: string,
        private onRegistered?: (instance: T) => void,
        private onUnregistered?: (instance: T) => void,
    ) {
        CollectionService.GetTagged(tag).forEach((instance) => this.registerInstance(instance as T));
        const addedConnection = CollectionService.GetInstanceAddedSignal(tag).Connect((instance) => {
            this.registerInstance(instance as T);
        });
        const removedConnection = CollectionService.GetInstanceRemovedSignal(tag).Connect((instance) => {
            this.unregisterInstance(instance as T);
        });
        this.cleanup = () => {
            addedConnection.Disconnect();
            removedConnection.Disconnect();
            table.clear(this);
        };
    }

    private registerInstance(instance: T) {
        this.INSTANCES.add(instance);
        instance.AncestryChanged.Connect(() => {
            if (instance.Parent === undefined) {
                this.unregisterInstance(instance);
            }
        });
        this.onRegistered?.(instance);
    }

    private unregisterInstance(instance: T) {
        this.INSTANCES.delete(instance);
        this.onUnregistered?.(instance);
    }

    destroy() {
        this.cleanup?.();
    }
}

export class SingleWorldNode<T extends Instance = Instance> extends WorldNode<T> {
    originalParent?: Instance;

    constructor(tag: string, onRegistered?: (instance: T) => void, onUnregistered?: (instance: T) => void) {
        super(
            tag,
            (instance) => {
                this.originalParent = instance.Parent;
                onRegistered?.(instance);
            },
            onUnregistered,
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
        while (instance === undefined) {
            task.wait();
            instance = this.getInstance();
            if (timeout && tick() - startTime > timeout) {
                throw `Timed out waiting for instance with tag ${this.tag}`;
            }
        }
        return instance;
    }
}
