/**
 * Abstract class representing a reloadable module.
 * Modules extending this class must implement an id and an unload method.
 */
export abstract class Reloadable {
    /** Unique identifier for this reloadable module. */
    abstract id: string;

    /** Method to unload resources or perform cleanup. */
    abstract unload(): void;
}

/**
 * HotReloader class to manage hot-reloading of modules.
 * It tracks modules and their instances, allowing for unloading and reloading.
 */
export class HotReloader<T extends Reloadable> {
    readonly MODULES = new Map<string, ModuleScript>();
    readonly RELOADABLE_PER_ID = new Map<string, T>();

    constructor(private root: Instance) {}

    /**
     * Reloads all ModuleScripts under the root instance and updates the MODULES map.
     */
    private reloadModules() {
        this.MODULES.clear();
        for (const moduleScript of this.root.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
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
    private load() {
        for (const [_, moduleScript] of this.MODULES) {
            const i = require(moduleScript);
            if (i !== undefined) {
                const reloadable = i as T;
                this.RELOADABLE_PER_ID.set(reloadable.id, reloadable);
            }
        }
        return this.RELOADABLE_PER_ID;
    }

    public unload() {
        for (const [, reloadable] of this.RELOADABLE_PER_ID) {
            reloadable.unload();
        }
        this.RELOADABLE_PER_ID.clear();
    }
}
