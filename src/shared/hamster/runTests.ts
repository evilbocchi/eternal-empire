import { runCLI } from "@rbxts/jest";
import { ServerStorage } from "@rbxts/services";

/**
 *  Runs the test suite with optional filtering by test name pattern.
 *  @param testNamePattern Optional pattern to filter test names.
 *  @returns Exit code: 0 if all tests pass, 1 if any test fails.
 */
export = (testNamePattern?: string) => {
    // force chalk to load with the right color level
    const [chalkSuccess, Chalk] = import("@rbxts-js/chalk-lua").await();
    if (chalkSuccess) {
        (Chalk as unknown as { level: number }).level = 3;
    }

    const cwd = ServerStorage.WaitForChild("tests");

    // Build Jest options
    const jestOptions: { testNamePattern?: string } = {};

    // Add test name filter if provided
    if (testNamePattern !== undefined && testNamePattern !== "") {
        jestOptions.testNamePattern = testNamePattern;
    }

    // run jest and capture results
    const [success, resolved] = runCLI(cwd, jestOptions, [cwd]).await();

    if (!success) {
        warn("Jest CLI failed to run.");
        return 1;
    }

    const results = resolved.results;
    const hasFailures = !results.success || results.numFailedTests > 0 || results.numFailedTestSuites > 0;
    return hasFailures ? 1 : 0;
};
