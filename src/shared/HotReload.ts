/**
 * Abstract class representing a reloadable module.
 * Modules extending this class must implement an id and an unload method.
 */
export abstract class Reloadable {
    /**
     * Abstract method to load the module, called after the class is instantiated.
     * Should return a cleanup function to be called on unload, or undefined if no cleanup is needed.
     * @returns A cleanup function or undefined.
     */
    abstract load(): (() => void) | undefined;

    constructor(
        readonly id: string,
        protected readonly hotReloader: HotReloader<Reloadable>,
    ) {}

    /**
     * Ensures the instance is registered in the HotReloader's map by its ID.
     * If an instance with the same ID already exists, it returns that instance instead.
     * @returns The existing or newly registered instance.
     */
    reconcile(): this {
        const existing = this.hotReloader.RELOADABLE_PER_ID.get(this.id);
        if (existing !== undefined) {
            return existing as this;
        }
        this.hotReloader.RELOADABLE_PER_ID.set(this.id, this);
        return this;
    }
}

/**
 * HotReloader class to manage hot-reloading of modules.
 * It tracks modules and their instances, allowing for unloading and reloading.
 */
export class HotReloader<T extends Reloadable> {
    readonly MODULES = new Map<string, ModuleScript>();
    readonly RELOADABLE_PER_ID = new Map<string, T>();
    readonly CLEANUP_PER_RELOADABLE = new Map<T, () => void>();

    /**
     * Set of instances to exclude from reloading.
     */
    private exclude = new Set<Instance>();

    constructor(
        private root: Instance,
        exclude?: Set<Instance>,
    ) {
        if (exclude) this.exclude = exclude;
    }

    /**
     * Reloads all ModuleScripts under the root instance and updates the MODULES map.
     */
    private reloadModules() {
        this.MODULES.clear();
        for (const moduleScript of this.root.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && !this.exclude.has(moduleScript)) {
                this.MODULES.set(moduleScript.Name, moduleScript.Clone());
            }
        }
    }

    /**
     * Reloads all modules and their instances by unloading existing ones and loading new ones.
     * @return Map of reloadable instances by their IDs.
     */
    public reload() {
        this.reloadModules();
        this.unload();
        return this.load();
    }

    /**
     * Loads all ModuleScripts in the MODULES map, requires them, and stores instances of Reloadable in the RELOADABLE_PER_ID map.
     * @return Map of reloadable instances by their IDs.
     */
    public load() {
        for (const [id, moduleScript] of this.MODULES) {
            if (this.RELOADABLE_PER_ID.has(id)) {
                continue;
            }

            const i = require(moduleScript);
            if (i !== undefined) {
                const reloadable = i as T;
                this.RELOADABLE_PER_ID.set(reloadable.id, reloadable);
                const cleanup = reloadable.load();
                if (cleanup !== undefined) {
                    this.CLEANUP_PER_RELOADABLE.set(reloadable, cleanup);
                }
            }
        }
        return this.RELOADABLE_PER_ID;
    }

    public unload() {
        for (const [, cleanup] of this.CLEANUP_PER_RELOADABLE) {
            cleanup();
        }
        this.RELOADABLE_PER_ID.clear();
        this.CLEANUP_PER_RELOADABLE.clear();
    }
}
