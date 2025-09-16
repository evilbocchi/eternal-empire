import { Flamework } from "@flamework/core";
import { RunService, Workspace } from "@rbxts/services";

/**
 * Whether the current context is the server.
 */
export const IS_SERVER = RunService.IsServer();

/**
 * Whether the game is running in a Continuous Integration (CI) environment.
 *
 * This is true when physics simulation is not running.
 */
export const IS_CI = !RunService.IsRunning();

/**
 * Whether the current context is Roblox Studio.
 */
export const IS_STUDIO = RunService.IsStudio();

/**
 * Whether the game is in Single Server mode.
 */
export const IS_SINGLE_SERVER = game.PlaceId === 17479698702;

export const IS_PUBLIC_SERVER = (() => {
    if (IS_CI) return false;
    let key = "IsPublicServer";
    if (!IS_SERVER) return Workspace.GetAttribute(key) === true;

    let value = false;
    if (IS_STUDIO) {
        const boolValue = Workspace.FindFirstChild("StartCamera")?.FindFirstChild("StartScreen") as
            | BoolValue
            | undefined;
        value = boolValue?.Value ?? false;
    }

    value = game.PrivateServerId === "";
    Workspace.SetAttribute(key, value);
    return value;
})();

export function preloadFlameworkClient() {
    Flamework.addPaths("src/client/controllers");
}

export function igniteFlameworkClient() {
    preloadFlameworkClient();
    Flamework.ignite();
}

export function preloadFlameworkServer() {
    Flamework.addPaths("src/server/services");
}

export function igniteFlameworkServer() {
    preloadFlameworkServer();
    Flamework.ignite();
}

export function igniteFlameworkCI() {
    preloadFlameworkClient();
    preloadFlameworkServer();
}
