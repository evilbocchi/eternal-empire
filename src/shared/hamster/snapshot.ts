/**
 * @fileoverview Provides a snapshot system for capturing and restoring instance properties.
 * This is used to revert world changes made by quests during hot reloading.
 *
 * @since 1.0.0
 */

type SnapshotData = {
    instance: Instance;
    properties: Map<string, unknown>;
};

/**
 * Global registry of snapshots that can be restored on hot reload
 */
const SNAPSHOT_REGISTRY = new Map<Instance, SnapshotData>();

/**
 * Captures the current state of an instance's properties
 * @param instance The instance to snapshot
 * @param properties The properties to capture (defaults to common properties based on instance type)
 * @returns A snapshot object that can be used to restore the instance
 */
export function captureSnapshot(instance: Instance, properties?: ReadonlyArray<string>): SnapshotData {
    const snapshot: SnapshotData = {
        instance,
        properties: new Map(),
    };

    // If no properties specified, use defaults based on instance type
    if (properties === undefined) {
        if (instance.IsA("BasePart")) {
            properties = ["CFrame", "Transparency", "CanCollide", "Anchored", "Color"];
        } else if (instance.IsA("Decal")) {
            properties = ["Texture", "Transparency"];
        } else if (instance.IsA("ParticleEmitter") || instance.IsA("Beam")) {
            properties = ["Enabled"];
        } else if (instance.IsA("PointLight")) {
            properties = ["Brightness", "Range", "Color", "Enabled"];
        } else if (instance.IsA("ProximityPrompt")) {
            properties = ["Enabled"];
        } else {
            // Default: no properties to snapshot
            properties = [];
        }
    }

    // Capture the current values
    const instanceRecord = instance as unknown as Record<string, unknown>;
    for (const prop of properties) {
        snapshot.properties.set(prop, instanceRecord[prop]);
    }

    // Register the snapshot for hot reload restoration
    SNAPSHOT_REGISTRY.set(instance, snapshot);

    return snapshot;
}

/**
 * Restores an instance to its snapshotted state
 * @param snapshot The snapshot to restore
 */
export function restoreSnapshot(snapshot: SnapshotData) {
    const { instance, properties } = snapshot;
    if (instance.Parent === undefined) {
        // Instance was destroyed, skip restoration
        return;
    }

    const instanceRecord = instance as unknown as Record<string, unknown>;
    for (const [key, value] of properties) {
        instanceRecord[key] = value;
    }
}

/**
 * Restores all registered snapshots (used during hot reload)
 */
export function restoreAllSnapshots() {
    for (const [instance, snapshot] of SNAPSHOT_REGISTRY) {
        restoreSnapshot(snapshot);
    }
}

/**
 * Clears a snapshot from the registry
 * @param instance The instance whose snapshot should be cleared
 */
export function clearSnapshot(instance: Instance) {
    SNAPSHOT_REGISTRY.delete(instance);
}

/**
 * Clears all snapshots from the registry
 */
export function clearAllSnapshots() {
    SNAPSHOT_REGISTRY.clear();
}

/**
 * Creates a snapshot and returns a cleanup function that restores it
 * @param instance The instance to snapshot
 * @param properties Optional array of properties to snapshot
 * @returns A cleanup function that restores the snapshot
 */
export function snapshotAndRestore(instance: Instance, properties?: ReadonlyArray<string>): () => void {
    const snapshot = captureSnapshot(instance, properties);
    return () => {
        restoreSnapshot(snapshot);
        clearSnapshot(instance);
    };
}
