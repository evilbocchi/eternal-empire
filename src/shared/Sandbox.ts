import { ReplicatedStorage, Workspace } from "@rbxts/services";
import BuildBounds from "shared/placement/BuildBounds";

/**
 * Provides utilities for managing the sandbox environment in the game,
 * including toggling sandbox mode, creating baseplate bounds, and synthesizing workspace objects.
 */
export default class Sandbox {
    static readonly sandboxValue = (() => {
        const value = Workspace.FindFirstChild("SANDBOX") as BoolValue | undefined;
        if (value?.Value === true) {
            Workspace.SetAttribute("Sandbox", true);
        }
        return value;
    })();

    /**
     * Creates BuildBounds for the baseplate if sandbox mode is enabled.
     * @returns The BuildBounds instance or undefined if not available.
     */
    static createBaseplateBounds() {
        if (!this.getEnabled()) return undefined;

        const baseplate = Workspace.FindFirstChild("Baseplate") as Part;
        if (baseplate === undefined) {
            return undefined;
        }
        return new BuildBounds(baseplate);
    }

    /**
     * Checks if sandbox mode is enabled.
     * @returns True if sandbox mode is enabled, false otherwise.
     */
    static getEnabled() {
        return Workspace.GetAttribute("Sandbox") === true;
    }

    /**
     * Synthesizes and sets up sandbox workspace objects if sandbox mode is enabled.
     * @returns True if synthesis occurred, false otherwise.
     */
    static synthesise() {
        if (!this.getEnabled()) {
            return false;
        }
        const workspaceModels = Workspace.FindFirstChild("ItemModels");
        if (workspaceModels !== undefined) {
            workspaceModels.Parent = ReplicatedStorage;
        }
        return true;
    }

    static getId() {
        return this.sandboxValue?.GetAttribute("Id") as string | undefined;
    }
}
