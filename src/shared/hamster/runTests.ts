import { FletchetteEnvironment } from "@rbxts/fletchette";
import { Janitor } from "@rbxts/janitor";
import { ServerScriptService } from "@rbxts/services";
import TestEZ from "@rbxts/testez";
import { eater } from "shared/hamster/eat";
import { createFancyTextReporter } from "shared/hamster/FancyTextReporter";

export = () => {
    const root = ServerScriptService.WaitForChild("TS").WaitForChild("tests");

    const lines = new Array<string>();
    lines.push(`Running tests in: ${root.GetFullName()}`);

    let startClock = os.clock();
    const janitor = new Janitor();
    eater.janitor = janitor; // Tests should create their own janitors, but ensure the entire test suite is sandboxed
    FletchetteEnvironment.setVirtualState(true);

    const reporter = createFancyTextReporter();
    const results = TestEZ.TestBootstrap.run([root], reporter);

    const fancyLines = [...reporter.getLines()];
    const fancyFailures = [...reporter.getFailures()];

    if (fancyLines.size() > 0) {
        lines.push("");
        for (const entry of fancyLines) {
            lines.push(entry);
        }
        lines.push("");
    }

    lines.push(`${results.successCount} passed, ${results.failureCount} failed, ${results.skippedCount} skipped`);
    if (results.failureCount > 0) {
        lines.push(`${results.failureCount} test nodes reported failures.`);
    }
    if (results.errors.size() > 0) {
        lines.push("Errors reported by tests:");
        lines.push("");
        for (const message of results.errors) {
            lines.push(message);
            lines.push("");
        }
    }

    janitor.Destroy();
    const durationMs = math.floor((os.clock() - startClock) * 1000 * 100) / 100;
    lines.push(`Tests completed in ${durationMs}ms`);

    return {
        lines,
        success: results.failureCount === 0 && results.errors.size() === 0,
        successCount: results.successCount,
        failureCount: results.failureCount,
        skippedCount: results.skippedCount,
        durationMs,
        failures: fancyFailures,
    };
};
