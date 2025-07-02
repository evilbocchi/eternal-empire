import { OnStart, Service } from "@flamework/core";
import { RunService, Workspace } from "@rbxts/services";

@Service()
export default class DiagnosticService implements OnStart {

    isStudio = RunService.IsStudio();

    onInit() {

    }

    onStart() {
        task.spawn(() => {
            while (task.wait(2)) {
                const throttling = Workspace.GetPhysicsThrottling();
                if (throttling < 100) {
                    warn("Physics is being throttled!", throttling);
                }
            }
        });
    }
}