import { Players, RunService } from "@rbxts/services";

const IS_EDIT = RunService.IsStudio() && (!RunService.IsRunning() || (RunService.IsServer() && RunService.IsClient()));
if (!IS_EDIT) {
    // Only import modules if not in edit mode to avoid duplicate runtime errors in simulation stories.

    const [s1, sandbox] = import("shared/Sandbox").await();
    if (!s1) {
        throw "Failed to load sandbox";
    }
    const Sandbox = sandbox.default;
    // If sandbox was synthesized (we're running a sandboxed simulation), disable
    // automatic character loading so simulation stories can control character spawn.
    if (Sandbox.synthesise()) {
        Players.CharacterAutoLoads = false;
    }

    const [s2, context] = import("shared/Context").await();
    if (!s2) {
        throw "Failed to load context";
    }
    context.igniteFlameworkServer();
}
