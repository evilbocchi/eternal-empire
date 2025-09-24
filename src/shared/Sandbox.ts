import { ReplicatedStorage, Workspace } from "@rbxts/services";
import BuildBounds from "shared/placement/BuildBounds";

/**
 * Provides utilities for managing the sandbox environment in the game,
 * including toggling sandbox mode, creating baseplate bounds, and synthesizing workspace objects.
 */
export default class Sandbox {
    static readonly sandboxValue = Workspace.FindFirstChild("SANDBOX") as BoolValue | undefined;

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
     * Sets the sandbox mode enabled or disabled.
     * @param value True to enable sandbox mode, false to disable.
     */
    static setEnabled(value: boolean) {
        Workspace.SetAttribute("Sandbox", value);
    }

    /**
     * Synthesizes and sets up sandbox workspace objects if sandbox mode is enabled.
     * @returns True if synthesis occurred, false otherwise.
     */
    static synthesise() {
        if (!this.getEnabled()) {
            return false;
        }

        const wanderers = new Instance("Folder");
        wanderers.Name = "Wanderers";
        wanderers.Parent = Workspace;

        const waypoints = new Instance("Folder");
        waypoints.Name = "Waypoints";
        waypoints.Parent = Workspace;

        const startCamera = new Instance("Part");
        startCamera.Name = "StartCamera";
        startCamera.Anchored = true;
        startCamera.Parent = Workspace;

        Workspace.WaitForChild("ItemModels").Parent = ReplicatedStorage;

        return true;
    }

    static {
        if (this.sandboxValue !== undefined && this.sandboxValue.Value) {
            this.setEnabled(true);
        }
    }
}
