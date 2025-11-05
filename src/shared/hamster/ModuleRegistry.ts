import eat from "shared/hamster/eat";

/**
 * Base class for identifiable objects with a unique ID.
 */
export abstract class Identifiable {
    /**
     * Abstract method to initialize the module, called the entire module is required.
     * Should return a cleanup function to be called on story unmount, or undefined if no cleanup is needed.
     * @returns A cleanup function or undefined.
     */
    abstract init(): (() => void) | undefined;

    /**
     * Constructs an identifiable object with a unique ID.
     * @param id The unique identifier for the instance.
     */
    constructor(readonly id: string) {}
}

/**
 * Manages the loading and reloading of modules that extend Identifiable.
 */
export class ModuleRegistry<T extends Identifiable> {
    readonly MODULES = new Map<string, ModuleScript>();
    readonly OBJECTS = new Map<string, T>();

    private loadCallback?: (identifiablePerId: Map<string, T>) => void;

    /**
     * Set of instances to exclude from loading.
     */
    private exclude = new Set<Instance>();

    constructor(
        private root: Instance,
        exclude?: Set<Instance>,
    ) {
        if (exclude) this.exclude = exclude;
        eat(() => {
            this.OBJECTS.clear();
        });
    }

    /**
     * Sets a callback to be invoked after loading modules.
     * @param callback The callback function to set.
     * @returns The HotReloader instance for chaining.
     */
    setLoadCallback(callback: (reloadablePerId: Map<string, T>) => void) {
        this.loadCallback = callback;
        return this;
    }

    /**
     * Loads all ModuleScripts under the root instance and updates the MODULES map.
     */
    private loadModules() {
        this.MODULES.clear();
        for (const moduleScript of this.root.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && !this.exclude.has(moduleScript)) {
                this.MODULES.set(moduleScript.Name, moduleScript);
            }
        }
    }

    /**
     * Loads all modules and populates the REGISTRY map.
     * This yields until all modules are loaded.
     * @return Map of reloadable instances by their IDs.
     */
    public load() {
        this.loadModules();
        for (const [id, moduleScript] of this.MODULES) {
            if (this.OBJECTS.has(id)) {
                continue;
            }

            const i = require(moduleScript);
            if (i !== undefined) {
                const reloadable = i as T;
                const id = reloadable.id;
                if (id !== undefined) {
                    this.OBJECTS.set(id, reloadable);
                }
                const cleanup = reloadable.init();
                if (cleanup !== undefined) {
                    eat(cleanup);
                }
            }
        }
        eat(() => {
            this.OBJECTS.clear();
            this.MODULES.clear();
        });
        this.loadCallback?.(this.OBJECTS);
        return this.OBJECTS;
    }
}
