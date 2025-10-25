/// <reference types="@rbxts/types/plugin" />
import { FletchetteEnvironment } from "@rbxts/fletchette";
import { Janitor } from "@rbxts/janitor";
import { runCLI } from "@rbxts/jest";
import { ServerScriptService } from "@rbxts/services";
import { eater } from "shared/hamster/eat";

export = () => {
    const root = ServerScriptService.WaitForChild("tests");

    const lines = new Array<string>();
    lines.push(`Running tests in: ${root.GetFullName()}`);

    let startClock = os.clock();
    const janitor = new Janitor();
    eater.janitor = janitor; // Tests should create their own janitors, but ensure the entire test suite is sandboxed
    FletchetteEnvironment.setVirtualState(true);

    const [success, output] = runCLI(
        root,
        {
            verbose: false,
            ci: false,
        },
        [root],
    ).await();

    if (!success) {
        lines.push("Failed to run tests:");
        lines.push(tostring(output));
        return {
            lines,
            success: false,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
            durationMs: 0,
            failures: [],
        };
    }

    const results = output.results;

    janitor.Destroy();
    const durationMs = math.floor((os.clock() - startClock) * 1000 * 100) / 100;
    lines.push(`Tests completed in ${durationMs}ms`);

    return {
        lines,
        success: results.numFailedTests === 0 && results.wasInterrupted === false,
        successCount: results.numPassedTests,
        failureCount: results.numFailedTests,
        skippedCount: results.numPendingTests,
        durationMs,
    };
};
