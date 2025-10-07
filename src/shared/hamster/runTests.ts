import { Janitor } from "@rbxts/janitor";
import { ServerScriptService } from "@rbxts/services";
import TestEZ from "@rbxts/testez";
import { eater } from "shared/hamster/eat";

export = () => {
    const root = ServerScriptService;

    const lines = new Array<string>();
    lines.push(`Running tests in: ${root.GetFullName()}`);

    let startClock = os.clock();
    const janitor = new Janitor();
    eater.janitor = janitor; // Tests should create their own janitors, but ensure the entire test suite is sandboxed

    const results = TestEZ.TestBootstrap.run([root]);

    lines.push("Test results:");
    const reportLines = new Array<string>();

    for (const err of results.errors) {
        reportLines.push(`    ! ERROR: ${err}`);
    }
    for (const entry of reportLines) {
        lines.push(entry);
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
    };
};
