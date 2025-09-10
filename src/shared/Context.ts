import { Flamework } from "@flamework/core";
import { RunService } from "@rbxts/services";

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
 * Whether the game is in Single Server mode.
 */
export const IS_SINGLE_SERVER = game.PlaceId === 17479698702;

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
