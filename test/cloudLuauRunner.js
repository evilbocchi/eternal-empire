import axios from "axios";
import fs from "fs";
import path from "path";

const PROTECTED_PLACE_ID = 16438564807;

function defaultLog(message, level = "info") {
    switch (level) {
        case "error":
            console.error(message);
            break;
        case "warn":
            console.warn(message);
            break;
        case "debug":
            if (typeof console.debug === "function") {
                console.debug(message);
            } else {
                console.log(message);
            }
            break;
        case "log":
            console.log(message);
            break;
        default:
            console.info(message);
            break;
    }
}

function applyTransform(transform, value) {
    if (typeof transform !== "function" || typeof value !== "string") {
        return value;
    }

    try {
        return transform(value) ?? value;
    } catch {
        return value;
    }
}

async function createTask({ axiosInstance, executionKey, universeId, placeId, scriptContents, placeVersion, log }) {
    log(
        `Creating task for place ${placeId} in universe ${universeId}${
            placeVersion ? ` (version ${placeVersion})` : ""
        }`,
        "debug",
    );

    try {
        const baseUrl = `https://apis.roblox.com/cloud/v2/universes/${universeId}/places/${placeId}`;
        const url = placeVersion
            ? `${baseUrl}/versions/${placeVersion}/luau-execution-session-tasks`
            : `${baseUrl}/luau-execution-session-tasks`;

        const response = await axiosInstance({
            method: "post",
            url,
            data: {
                script: scriptContents,
                timeout: "60s",
            },
            headers: {
                "x-api-key": executionKey,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        log("Error creating task:", "error");
        log(`Status: ${error.response?.status}`, "error");
        log(`Status Text: ${error.response?.statusText}`, "error");
        log(`Data: ${JSON.stringify(error.response?.data)}`, "error");
        log(`Request URL: ${error.config?.url}`, "error");
        if (error.response?.status === 403) {
            log("This may be a WAF blocked request or authentication issue", "error");
        }
        throw error;
    }
}

async function pollForTaskCompletion({ axiosInstance, executionKey, taskPath, log }) {
    let task = null;

    log(`Polling task status at: https://apis.roblox.com/${taskPath}`, "debug");

    const start = Date.now();
    let lastLoggedState = null;
    let iterations = 0;

    while (!task || (task.state !== "COMPLETE" && task.state !== "FAILED")) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            const response = await axiosInstance.get(`https://apis.roblox.com/cloud/v2/${taskPath}`, {
                headers: {
                    "x-api-key": executionKey,
                },
            });

            task = response.data;
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);

            if (task.state !== lastLoggedState) {
                log(`Task state: ${task.state} (after ${elapsed}s)`, "debug");
                lastLoggedState = task.state;
            }

            if (iterations++ >= 3) {
                const statusLine = `Task state: ${task.state} (after ${elapsed}s)`;
                if (typeof process?.stdout?.write === "function") {
                    process.stdout.write(`\r${statusLine}${" ".repeat(Math.max(0, 80 - statusLine.length))}`);
                }
                iterations = 0;
            }
        } catch (error) {
            log("Error polling task completion:", "warn");
            log(`Status: ${error.response?.status}`, "warn");
            log(`Data: ${JSON.stringify(error.response?.data)}`, "warn");
            if (error.response?.status === 403) {
                log("WAF may be blocking polling requests", "warn");
            }
        }
    }

    if (typeof process?.stdout?.write === "function") {
        process.stdout.write("\r" + " ".repeat(80) + "\r");
    }

    log(`Task ${task.state.toLowerCase()}: ${task.path}`, "debug");

    return task;
}

async function getTaskLogs({ axiosInstance, executionKey, taskPath, log }) {
    try {
        const response = await axiosInstance.get(`https://apis.roblox.com/cloud/v2/${taskPath}/logs`, {
            headers: {
                "x-api-key": executionKey,
            },
        });

        return response.data;
    } catch (error) {
        log("Error getting task logs:", "error");
        log(`Status: ${error.response?.status}`, "error");
        log(`Data: ${JSON.stringify(error.response?.data)}`, "error");
        if (error.response?.status === 403) {
            log("WAF may be blocking log retrieval requests", "error");
        }
        throw error;
    }
}

function analyzeTaskLogs(logs, log, transform) {
    let failedTests = 0;
    let totalTests = 0;

    const groups = logs?.luauExecutionSessionTaskLogs;
    if (!Array.isArray(groups)) {
        return { failedTests, totalTests };
    }

    for (const entry of groups) {
        if (!entry || !Array.isArray(entry.messages)) {
            continue;
        }

        for (const raw of entry.messages) {
            const message = typeof raw === "string" ? raw : JSON.stringify(raw);
            log(applyTransform(transform, message), "log");

            const testResultMatch = message.match(/(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped/);
            if (testResultMatch) {
                const passed = Number.parseInt(testResultMatch[1], 10);
                const failed = Number.parseInt(testResultMatch[2], 10);
                const skipped = Number.parseInt(testResultMatch[3], 10);

                if (Number.isFinite(passed) && Number.isFinite(failed) && Number.isFinite(skipped)) {
                    totalTests += passed + failed + skipped;
                }

                if (Number.isFinite(failed)) {
                    failedTests += failed;
                }
            }

            const suiteSummaryMatch = message.match(/Test Suites:\s+(\d+)\s+failed/);
            if (suiteSummaryMatch) {
                const failed = Number.parseInt(suiteSummaryMatch[1], 10);
                if (Number.isFinite(failed)) {
                    failedTests += failed;
                }
            }
        }
    }

    return { failedTests, totalTests };
}

async function runLuauExecution({
    axiosInstance,
    executionKey,
    universeId,
    placeId,
    placeVersion,
    scriptContents,
    scriptSource,
    log,
    transform,
    skipProtectedPlaceCheck,
}) {
    if (!skipProtectedPlaceCheck && Number.parseInt(placeId, 10) === PROTECTED_PLACE_ID) {
        log(
            "Detected protected place ID; skipping Luau cloud tests. Please use your own place ID for testing.",
            "error",
        );
        return false;
    }

    if (placeVersion) {
        log(`Executing Luau task on version ${placeVersion}`, "debug");
    } else {
        log("Executing Luau task on latest published version", "debug");
    }

    if (scriptSource) {
        log(`Using Luau script from ${scriptSource}`, "debug");
    }

    try {
        const task = await createTask({
            axiosInstance,
            executionKey,
            universeId,
            placeId,
            scriptContents,
            placeVersion,
            log,
        });
        log(`Created task: ${task.path}`, "debug");

        const completedTask = await pollForTaskCompletion({
            axiosInstance,
            executionKey,
            taskPath: task.path,
            log,
        });

        const logs = await getTaskLogs({
            axiosInstance,
            executionKey,
            taskPath: task.path,
            log,
        });

        const { failedTests } = analyzeTaskLogs(logs, log, transform);

        if (completedTask.state === "COMPLETE") {
            if (failedTests > 0) {
                log(`Luau task completed but ${failedTests} test(s) failed`, "error");
                return false;
            }

            log("Luau task completed successfully", "debug");
            return true;
        }

        const errorCode = completedTask.error?.code ?? "UNKNOWN";
        const errorMessage = completedTask.error?.message ?? "Luau task failed";
        log(`${errorCode} ${errorMessage}`, "error");
        log("Luau task failed", "error");
        return false;
    } catch (error) {
        const detail =
            error?.response?.data && typeof error.response.data === "object"
                ? JSON.stringify(error.response.data)
                : error?.response?.data ?? error?.message ?? String(error);

        log(`Error executing Luau task: ${detail}`, "error");
        return false;
    }
}

export async function runCloudLuau(scriptFile, options = {}) {
    const {
        scriptContents: inlineScriptContents,
        executionKey = process.env.LUAU_EXECUTION_KEY,
        universeId = process.env.LUAU_EXECUTION_UNIVERSE_ID,
        placeId = process.env.LUAU_EXECUTION_PLACE_ID,
        placeVersion = process.env.PLACE_VERSION ?? null,
        log = defaultLog,
        transform = (value) => value,
        axiosInstance = axios,
        skipProtectedPlaceCheck = false,
    } = options;

    const headersDefaults = (axiosInstance.defaults.headers ||= {});
    const commonHeaders = (headersDefaults.common ||= {});
    if (!commonHeaders["User-Agent"]) {
        commonHeaders["User-Agent"] = "Node.js/Roblox-Test-Runner";
    }

    const missing = [];
    if (!executionKey) missing.push("LUAU_EXECUTION_KEY");
    if (!universeId) missing.push("LUAU_EXECUTION_UNIVERSE_ID");
    if (!placeId) missing.push("LUAU_EXECUTION_PLACE_ID");

    if (missing.length > 0) {
        log("Skipping cloud tests: Required environment variables not set", "warn");
        log("Missing:", "warn");
        for (const key of missing) {
            log(`  - ${key}`, "warn");
        }
        return null;
    }

    let scriptContents = inlineScriptContents ?? null;
    let resolvedScriptPath = null;

    if (!scriptContents) {
        if (!scriptFile) {
            throw new Error("runCloudLuau requires a script file path or scriptContents option.");
        }

        resolvedScriptPath = path.resolve(scriptFile);
        scriptContents = fs.readFileSync(resolvedScriptPath, "utf8");
    } else if (scriptFile) {
        resolvedScriptPath = path.resolve(scriptFile);
    }

    return runLuauExecution({
        axiosInstance,
        executionKey,
        universeId,
        placeId,
        placeVersion,
        scriptContents,
        scriptSource: resolvedScriptPath,
        log,
        transform,
        skipProtectedPlaceCheck,
    });
}
