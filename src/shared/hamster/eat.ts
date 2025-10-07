import { Janitor } from "@rbxts/janitor";
import { Environment } from "@rbxts/ui-labs";

export const eater = {
    janitor: Environment.GetJanitor() as Janitor<void> | undefined,
};

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
    return (eater.janitor as Janitor<U> | undefined)?.Add(object, methodName, index) ?? object;
}
