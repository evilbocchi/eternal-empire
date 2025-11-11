import { Flamework } from "@flamework/core";
import { RunService, Workspace } from "@rbxts/services";
import { eater } from "shared/hamster/eat";
import StartScreenValue from "shared/world/nodes/StartScreenValue";

/**
 * Whether the current context is the server.
 */
export const IS_SERVER = RunService.IsServer();

/**
 * Whether the game is running in an "edit" environment, where the experience is not running
 * and scripts are being run directly on the development server.
 */
export const IS_EDIT = eater.isEdit;

/**
 * Whether the current context is Roblox Studio.
 */
export const IS_STUDIO = RunService.IsStudio();

/**
 * Whether the game is in Single Server mode.
 */
export const IS_SINGLE_SERVER = game.PlaceId === 17479698702;

export const IS_PUBLIC_SERVER = (() => {
    if (IS_STUDIO) {
        return StartScreenValue.getInstance()?.Value ?? false;
    }

    let key = "IsPublicServer";
    if (!IS_SERVER) return Workspace.GetAttribute(key) === true;

    let value = game.PrivateServerId === "";
    Workspace.SetAttribute(key, value);
    return value;
})();

export function preloadFlameworkServer() {
    Flamework.addPaths("src/server/services");
}

export function igniteFlameworkServer() {
    preloadFlameworkServer();
    Flamework.ignite();
}
