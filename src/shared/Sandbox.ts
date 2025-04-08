import { ReplicatedStorage, Workspace } from "@rbxts/services";
import BuildBounds from "shared/placement/BuildBounds";

export default class Sandbox {

    static readonly sandboxValue = Workspace.FindFirstChild("SANDBOX") as BoolValue | undefined;

    static createBaseplateBounds() {
        if (!this.getEnabled())
            return undefined;

        const baseplate = Workspace.FindFirstChild("Baseplate") as Part;
        if (baseplate === undefined) {
            return undefined;
        }
        return new BuildBounds(baseplate);
    };

    static getEnabled() {
        return Workspace.GetAttribute("Sandbox") === true;
    }

    static setEnabled(value: boolean) {
        Workspace.SetAttribute("Sandbox", value);
    }

    static synthesise() {
        if (!this.getEnabled()) {
            return false;
        }

        const leaderboards = new Folder();
        leaderboards.Name = "Leaderboards";
        leaderboards.Parent = Workspace;

        const npcModels = new Folder();
        npcModels.Name = "NPCs";
        npcModels.Parent = Workspace;

        const waypoints = new Folder();
        waypoints.Name = "Waypoints";
        waypoints.Parent = Workspace;

        const startCamera = new Part();
        startCamera.Name = "StartCamera";
        startCamera.Anchored = true;
        startCamera.Parent = Workspace;

        const startScreen = new BoolValue();
        startScreen.Name = "StartScreen";
        startScreen.Value = false;
        startScreen.Parent = startCamera;

        const startId = new StringValue();
        startId.Name = "Id";
        startId.Value = this.sandboxValue?.GetAttribute("Id") as string ?? "";
        startId.Parent = startCamera;

        Workspace.WaitForChild("ItemModels").Parent = ReplicatedStorage;

        return true;
    }

    static {
        if (this.sandboxValue !== undefined && this.sandboxValue.Value) {
            this.setEnabled(true);
        }
    }
}