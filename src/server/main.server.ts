import { Players, RunService } from "@rbxts/services";

const IS_EDIT = RunService.IsStudio() && (!RunService.IsRunning() || (RunService.IsServer() && RunService.IsClient()));
if (!IS_EDIT) {
    // Only import modules if not in edit mode to avoid duplicate runtime errors in simulation stories.

    const [s1, sandbox] = import("shared/Sandbox").await();
    if (!s1) {
        throw "Failed to load sandbox";
    }
    const Sandbox = sandbox.default;
    if (!Sandbox.synthesise()) {
        Players.CharacterAutoLoads = false;
    }

    const [s2, context] = import("shared/Context").await();
    if (!s2) {
        throw "Failed to load context";
    }
    context.igniteFlameworkServer();

    if (!Sandbox.getEnabled()) {
        Players.CharacterAutoLoads = true;
        for (const player of Players.GetPlayers()) {
            player.LoadCharacter();
        }
    }
}
