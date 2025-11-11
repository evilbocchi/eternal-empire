import { Janitor } from "@rbxts/janitor";
import { RunService } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";

export const eater = {
    janitor: Environment.GetJanitor() as Janitor<void> | undefined,
    isEdit: !RunService.IsRunning() || (RunService.IsServer() && RunService.IsClient()),
};

const IS_EDIT = eater.isEdit;

/**
 * Utility function to eat an object by adding it to the janitor for automatic cleanup.
 * @param object The object to be cleaned up
 * @param methodName The method to call on cleanup, or true to call the object as a function
 * @param index The index to store the object under in the janitor
 * @returns The original object for convenience
 */
export default function eat<
    O extends keyof U extends never
        ? object
        : I extends keyof U
          ? U[I]
          : M extends true
            ? Callback | thread
            : M extends undefined
              ? RBXScriptConnection | { Destroy(): void }
              : object,
    M extends undefined | ((this: O) => void) | ((_: O) => void) | ExtractKeys<O, () => void> | true,
    I extends keyof U | undefined = undefined,
    U extends object | void = void,
>(object: O, methodName?: M, index?: I): O {
    const janitor = eater.janitor as Janitor<U> | undefined;

    if (janitor === undefined || janitor.Add === undefined) {
        if (!IS_EDIT) return object;

        // Janitor doesn't exist anymore, so create a temporary one to clean up this object
        const tempJanitor = new Janitor<U>();
        tempJanitor.Add(object, methodName, index);
        eater.janitor = tempJanitor;
        task.delay(5, () => {
            tempJanitor.Destroy();
        });
        return object;
    }

    return janitor.Add(object, methodName, index) ?? object;
}

/**
 * Takes a snapshot of an instance and registers it with the janitor for automatic restoration.
 * When the janitor is cleaned up, the instance will be restored to its original state.
 *
 * @param instance The instance to snapshot
 * @returns The original instance for convenience
 */
export function eatSnapshot<T extends Instance>(instance: T): T {
    const snapshot = instance.Clone() as T;
    const parent = instance.Parent;
    if (parent === undefined) return instance; // Cannot snapshot an instance without a parent

    eat(() => {
        instance.Destroy();
        snapshot.Parent = parent;
    });

    return instance;
}
