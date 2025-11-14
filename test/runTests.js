import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import readline from "readline";
import path from "path";
import signale from "signale";

// Configure logger with suppressed debug messages
const logger = new signale.Signale({
    logLevel: "info",
});

// Setup file logging
const logsDir = path.join(import.meta.dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

let fileLogger = null;
function initFileLogger(version) {
    const logFileName = version ? `test_${version}.log` : `test_latest.log`;
    const logFilePath = path.join(logsDir, logFileName);
    const logFd = fs.openSync(logFilePath, "a");

    fileLogger = {
        write: (message, level = "info") => {
            const timestamp = new Date().toISOString();
            const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
            // Use synchronous write to ensure immediate flush
            fs.writeSync(logFd, logLine);
        },
        fd: logFd,
        close: () => {
            fs.closeSync(logFd);
        },
    };

    fileLogger.write(`Test run started (mode: ${STUDIO_TEST_MODE})`, "info");
    return fileLogger;
}

function log(message, level = "info") {
    if (fileLogger) {
        fileLogger.write(message, level);
    }

    switch (level) {
        case "debug":
            // Debug messages only go to file, not console
            break;
        case "error":
            logger.error(message);
            break;
        case "warn":
            logger.warn(message);
            break;
        case "info":
            logger.info(message);
            break;
        case "log":
            console.log(message);
            break;
        default:
            logger.log(message);
            break;
    }
}

dotenv.config({ quiet: true });

// Add default headers to all axios requests to help avoid WAF blocks
axios.defaults.headers.common["User-Agent"] = "Node.js/Roblox-Test-Runner";

// Accept mode and version from command-line arguments, fallback to env var
let cliMode = null;
let cliVersion = null;
for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--mode=")) {
        cliMode = arg.slice("--mode=".length).toLowerCase();
    } else if (arg.startsWith("--version=")) {
        cliVersion = arg.slice("--version=".length);
    }
}
const STUDIO_TEST_MODE = (cliMode ?? process.env.STUDIO_TEST_MODE ?? "auto").toLowerCase();
const PLACE_VERSION = cliVersion ?? process.env.PLACE_VERSION ?? null;
const STUDIO_TEST_SERVER = process.env.STUDIO_TEST_SERVER ?? "http://localhost:28354";
const parsedStudioToolTimeout = Number.parseInt(process.env.STUDIO_TOOL_TIMEOUT_MS ?? "120000", 10);
const STUDIO_TOOL_TIMEOUT_MS = Number.isFinite(parsedStudioToolTimeout) ? parsedStudioToolTimeout : 120000;

const EXECUTION_KEY = process.env.LUAU_EXECUTION_KEY;
const UNIVERSE_ID = process.env.LUAU_EXECUTION_UNIVERSE_ID;
const PLACE_ID = process.env.LUAU_EXECUTION_PLACE_ID;

const scriptPath = path.join(import.meta.dirname, "invoker.lua");

log(`Reading Luau script from: ${scriptPath}`, "debug");
const luauScript = fs.readFileSync(scriptPath, "utf8");

const modulePathLookup = buildModulePathLookup();

function buildModulePathLookup() {
    const repoRoot = path.join(import.meta.dirname, "..");
    const lookup = new Map();
    const moduleRoots = [
        { moduleRoot: "ServerScriptService", dir: path.join(repoRoot, "out", "server") },
        { moduleRoot: "ReplicatedStorage.shared", dir: path.join(repoRoot, "out", "shared") },
        { moduleRoot: "ReplicatedStorage.client", dir: path.join(repoRoot, "out", "client") },
        { moduleRoot: "ReplicatedFirst", dir: path.join(repoRoot, "out", "sharedfirst") },
    ];

    const moduleFileSuffixes = [".luau", ".lua"];

    for (const { moduleRoot, dir } of moduleRoots) {
        if (!dir || !fs.existsSync(dir)) {
            continue;
        }

        const stack = [{ dir, segments: [] }];

        while (stack.length > 0) {
            const { dir: activeDir, segments } = stack.pop();
            let entries;

            try {
                entries = fs.readdirSync(activeDir, { withFileTypes: true });
            } catch {
                continue;
            }

            for (const entry of entries) {
                const entryPath = path.join(activeDir, entry.name);

                if (entry.isDirectory()) {
                    stack.push({ dir: entryPath, segments: [...segments, entry.name] });
                    continue;
                }

                if (!entry.isFile()) {
                    continue;
                }

                const suffix = moduleFileSuffixes.find((ext) => entry.name.endsWith(ext));
                if (!suffix) {
                    continue;
                }

                const baseName = entry.name.slice(0, -suffix.length);
                const moduleSegments = [...segments, baseName];
                const modulePath = [moduleRoot, ...moduleSegments.filter((segment) => segment.length > 0)].join(".");
                const relativePath = path.relative(repoRoot, entryPath).split(path.sep).join("/");

                lookup.set(modulePath, relativePath);

                if (baseName === "init" && segments.length > 0) {
                    const initModulePath = [moduleRoot, ...segments].join(".");
                    lookup.set(initModulePath, relativePath);
                }
            }
        }
    }

    return lookup;
}

function transformLuauPath(line) {
    // Transform Luau stack trace paths to compiled out/ files for clickability
    // e.g., [string "ServerScriptService.tests.weather.spec"]:15 -> out/server/tests/weather.spec.luau:15
    if (typeof line !== "string" || line.length === 0) {
        return line;
    }

    let transformed = line.replace(/\[string "([^\"]+)"\]/g, (fullMatch, modulePath) => {
        const resolved = resolveModulePath(modulePath);
        return resolved ?? fullMatch;
    });

    const moduleRootPattern = /(ServerScriptService|ReplicatedStorage\.shared|ReplicatedStorage\.client|ReplicatedFirst)(?:\.[^\s:\]]+)+/g;

    transformed = transformed.replace(moduleRootPattern, (fullMatch) => {
        const resolved = resolveModulePath(fullMatch);
        return resolved ?? fullMatch;
    });

    return transformed;
}

function resolveModulePath(modulePath) {
    if (!modulePath || modulePathLookup.size === 0) {
        return null;
    }

    if (modulePathLookup.has(modulePath)) {
        return modulePathLookup.get(modulePath);
    }

    const sanitized = modulePath.replace(/["'\[\]]/g, "");
    if (modulePathLookup.has(sanitized)) {
        return modulePathLookup.get(sanitized);
    }

    return null;
}

function updateFailureDetection(line, tracker) {
    if (!tracker || typeof line !== "string" || !line.includes("Test Suites:")) {
        return;
    }

    const failedMatch = line.match(/(\d+)\s+failed/);
    if (!failedMatch) {
        return;
    }

    const failedCount = Number.parseInt(failedMatch[1], 10);
    if (Number.isFinite(failedCount) && failedCount > 0) {
        tracker.detectedFailures = true;
    }
}

function analyzeStudioResultPayload(result, detectedFailures) {
    if (!result || typeof result !== "object") {
        return {
            success: false,
            summary: null,
            error: "Studio test runner returned an unexpected response.",
        };
    }

    const failureMessages = [];

    if (Array.isArray(result.failedSuites)) {
        for (const suite of result.failedSuites) {
            if (!suite || typeof suite !== "object") {
                continue;
            }

            const header = typeof suite.path === "string" && suite.path.length > 0 ? `Suite: ${suite.path}` : "Suite";
            const messages = Array.isArray(suite.messages)
                ? suite.messages
                      .filter((message) => typeof message === "string" && message.length > 0)
                      .map(transformLuauPath)
                : [];

            if (messages.length > 0) {
                failureMessages.push(`${header}\n${messages.join("\n")}`);
            }
        }
    }

    if (Array.isArray(result.failedTests)) {
        for (const test of result.failedTests) {
            if (!test || typeof test !== "object") {
                continue;
            }

            const path = typeof test.path === "string" && test.path.length > 0 ? test.path : "(unknown file)";
            const title =
                typeof test.fullName === "string" && test.fullName.length > 0
                    ? test.fullName
                    : typeof test.title === "string" && test.title.length > 0
                      ? test.title
                      : "(unknown test)";
            const messages = Array.isArray(test.failureMessages)
                ? test.failureMessages
                      .filter((message) => typeof message === "string" && message.length > 0)
                      .map(transformLuauPath)
                : [];

            if (messages.length > 0) {
                failureMessages.push(`Test: ${title}\nFile: ${path}\n${messages.join("\n")}`);
            }
        }
    }

    const summary = result.summary ?? null;
    if (summary) {
        const passed = summary.successCount ?? summary.passedSuites ?? 0;
        const failed = summary.failureCount ?? summary.failedSuites ?? 0;
        const skipped = summary.skippedCount ?? summary.pendingSuites ?? 0;
        const summaryMsg = `Studio summary: ${passed} passed, ${failed} failed, ${skipped} skipped over ${summary.totalTests ?? "?"} tests.`;
        log(summaryMsg, "info");
    }

    const baseError =
        typeof result.error === "string" && result.error.length > 0 ? transformLuauPath(result.error) : null;
    const combinedFailures = failureMessages.join("\n\n");
    const baseSuccess = result.success === true;
    const actualSuccess = baseSuccess && !detectedFailures;

    if (!actualSuccess) {
        return {
            success: false,
            summary,
            error: combinedFailures.length > 0 ? combinedFailures : (baseError ?? "Studio tests reported failures."),
        };
    }

    return {
        success: true,
        summary,
        error: null,
    };
}

function readStreamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];

        stream.on("data", (chunk) => {
            if (chunk === undefined) {
                return;
            }

            if (Buffer.isBuffer(chunk)) {
                chunks.push(chunk);
            } else {
                chunks.push(Buffer.from(String(chunk)));
            }
        });

        stream.on("end", () => {
            resolve(Buffer.concat(chunks).toString("utf8"));
        });

        stream.on("error", (error) => {
            reject(error);
        });
    });
}

async function consumeNdjsonStream(stream) {
    const tracker = { detectedFailures: false };

    return new Promise((resolve, reject) => {
        const lineReader = readline.createInterface({ input: stream, crlfDelay: Infinity });
        let finalResult = null;

        lineReader.on("line", (rawLine) => {
            const trimmed = typeof rawLine === "string" ? rawLine.trim() : "";
            if (trimmed.length === 0) {
                return;
            }

            let event;
            try {
                event = JSON.parse(trimmed);
            } catch {
                const transformed = transformLuauPath(trimmed);
                console.log(transformed);
                log(transformed, "info");
                return;
            }

            if (event.type === "log") {
                const message = typeof event.message === "string" ? event.message : "";
                const level = typeof event.level === "string" ? event.level : "info";

                if (message.length === 0) {
                    return;
                }

                updateFailureDetection(message, tracker);
                const transformed = transformLuauPath(message);

                if (level === "error") {
                    console.error(transformed);
                    log(transformed, "error");
                } else if (level === "warn") {
                    console.warn(transformed);
                    log(transformed, "warn");
                } else {
                    console.log(transformed);
                    log(transformed, "info");
                }
            } else if (event.type === "result") {
                if (event.result && typeof event.result === "object") {
                    finalResult = event.result;
                } else {
                    finalResult = {
                        success: event.success === true,
                        summary: event.summary ?? null,
                        error: typeof event.error === "string" ? event.error : null,
                    };
                }
            } else if (event.type === "error") {
                finalResult = {
                    success: false,
                    summary: null,
                    error: typeof event.error === "string" ? transformLuauPath(event.error) : "Studio tests failed.",
                };
            }
        });

        const finalize = () => {
            if (!finalResult) {
                resolve({
                    success: false,
                    summary: null,
                    error: "Studio test runner ended without providing a result.",
                });
                return;
            }

            resolve(analyzeStudioResultPayload(finalResult, tracker.detectedFailures));
        };

        lineReader.once("close", finalize);
        lineReader.once("error", reject);
        stream.once("error", (error) => {
            lineReader.close();
            reject(error);
        });
    });
}

async function runStudioTests() {
    log(`Checking Studio MCP server at ${STUDIO_TEST_SERVER}`, "info");

    let response;
    try {
        response = await axios({
            method: "post",
            url: `${STUDIO_TEST_SERVER}/mcp/call-tool?stream=1`,
            data: {
                name: "run_tests",
                arguments: {
                    timeoutMs: STUDIO_TOOL_TIMEOUT_MS,
                },
            },
            responseType: "stream",
            timeout: STUDIO_TOOL_TIMEOUT_MS + 5000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
    } catch (error) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;

        if (status === 503) {
            log("Studio MCP server reachable but plugin is not connected; skipping Studio tests.", "warn");
            return null;
        }

        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
            log(`Studio MCP server not reachable (${error.code}); skipping Studio tests.`, "warn");
            return null;
        }

        if (status === 404) {
            log("Studio MCP server does not expose the run_tests tool yet; skipping Studio tests.", "warn");
            return null;
        }

        const message =
            error.response?.data?.error ||
            (status ? `HTTP ${status} ${statusText ?? ""}`.trim() : (error.message ?? String(error)));

        return {
            success: false,
            summary: null,
            error: message,
        };
    }

    const contentType = String(response.headers?.["content-type"] ?? "").toLowerCase();
    if (contentType.includes("application/x-ndjson")) {
        return consumeNdjsonStream(response.data);
    }

    let rawBody;
    try {
        rawBody = await readStreamToString(response.data);
    } catch (streamError) {
        const message =
            streamError instanceof Error && streamError.message
                ? streamError.message
                : "Failed to read Studio test runner response stream.";
        return {
            success: false,
            summary: null,
            error: message,
        };
    }

    let body;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return {
            success: false,
            summary: null,
            error: "Studio test runner returned an unexpected response format.",
        };
    }

    if (!body || body.success !== true) {
        const errorMessage =
            body && typeof body.error === "string" && body.error.length > 0
                ? body.error
                : "Studio test runner returned an unexpected response.";
        return {
            success: false,
            summary: null,
            error: errorMessage,
        };
    }

    const result = body.result ?? {};
    const tracker = { detectedFailures: false };

    if (Array.isArray(result.stdout)) {
        for (const line of result.stdout) {
            if (typeof line !== "string") {
                continue;
            }

            const transformed = transformLuauPath(line);
            log(transformed, "log");
            updateFailureDetection(line, tracker);
        }
    }

    return analyzeStudioResultPayload(result, tracker.detectedFailures);
}

async function createTask(apiKey, scriptContents, universeId, placeId, version = null) {
    log(
        `Creating task for place ${placeId} in universe ${universeId}${version ? ` (version ${version})` : ""}`,
        "debug",
    );
    try {
        const url = version
            ? `https://apis.roblox.com/cloud/v2/universes/${universeId}/places/${placeId}/versions/${version}/luau-execution-session-tasks`
            : `https://apis.roblox.com/cloud/v2/universes/${universeId}/places/${placeId}/luau-execution-session-tasks`;

        const response = await axios({
            method: "post",
            url: url,
            data: {
                script: scriptContents,
                timeout: "60s",
            },
            headers: {
                "x-api-key": apiKey,
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

async function pollForTaskCompletion(apiKey, taskPath) {
    let task = null;

    log(`Polling task status at: https://apis.roblox.com/${taskPath}`, "debug");

    const start = Date.now();
    let lastLoggedState = null;

    while (!task || (task.state !== "COMPLETE" && task.state !== "FAILED")) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            const response = await axios.get(`https://apis.roblox.com/cloud/v2/${taskPath}`, {
                headers: {
                    "x-api-key": apiKey,
                },
            });

            task = response.data;
            const elapsed = ((Date.now() - start) / 1000).toFixed(1);

            // Only log state changes to file, not every poll
            if (task.state !== lastLoggedState) {
                log(`Task state: ${task.state} (after ${elapsed}s)`, "debug");
                lastLoggedState = task.state;
            }

            // Show live status on console only (not in file log)
            const statusLine = `Task state: ${task.state} (after ${elapsed}s)`;
            process.stdout.write(`\r${statusLine}${" ".repeat(Math.max(0, 80 - statusLine.length))}`);
        } catch (error) {
            log("Error polling task completion:", "warn");
            log(`Status: ${error.response?.status}`, "warn");
            log(`Data: ${JSON.stringify(error.response?.data)}`, "warn");
            if (error.response?.status === 403) {
                log("WAF may be blocking polling requests", "warn");
            }
        }
    }

    // Clear polling status line and print newline to console
    process.stdout.write("\r" + " ".repeat(80) + "\r");

    log(`Task ${task.state.toLowerCase()}: ${task.path}`, "debug");

    return task;
}

async function getTaskLogs(apiKey, taskPath) {
    try {
        const response = await axios.get(`https://apis.roblox.com/cloud/v2/${taskPath}/logs`, {
            headers: {
                "x-api-key": apiKey,
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

async function runLuauTask(universeId, placeId, scriptContents, version = null) {
    if (version) {
        log(`Executing Luau task on version ${version}`, "debug");
    } else {
        log("Executing Luau task on latest published version", "debug");
    }

    if (parseInt(placeId) === 16438564807) {
        log("Detected protected place ID; skipping Luau cloud tests. Please use your own place ID for testing.", "error");
        return false;   
    }

    try {
        const task = await createTask(EXECUTION_KEY, scriptContents, universeId, placeId, version);
        log(`Created task: ${task.path}`, "debug");

        const completedTask = await pollForTaskCompletion(EXECUTION_KEY, task.path);
        const logs = await getTaskLogs(EXECUTION_KEY, task.path);

        let failedTests = 0;
        let totalTests = 0;

        for (const taskLogs of logs.luauExecutionSessionTaskLogs) {
            const messages = taskLogs.messages;
            for (const message of messages) {
                const transformed = transformLuauPath(message);
                log(transformed, "log");

                // Check for test result summary line (e.g., "36 passed, 0 failed, 0 skipped")
                const testResultMatch = message.match(/(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped/);
                if (testResultMatch) {
                    const passed = parseInt(testResultMatch[1]);
                    const failed = parseInt(testResultMatch[2]);
                    const skipped = parseInt(testResultMatch[3]);

                    failedTests += failed;
                    totalTests += passed + failed + skipped;
                }

                // Also check for Jest suite summary format (e.g., "Test Suites: 13 failed, 13 total")
                const suiteSummaryMatch = message.match(/Test Suites:\s+(\d+)\s+failed/);
                if (suiteSummaryMatch) {
                    const failed = parseInt(suiteSummaryMatch[1]);
                    failedTests += failed;
                }
            }
        }

        if (completedTask.state === "COMPLETE") {
            if (failedTests > 0) {
                log(`Luau task completed but ${failedTests} test(s) failed`, "error");
                return false;
            } else {
                log("Luau task completed successfully", "debug");
                return true;
            }
        } else {
            log(`${completedTask.error.code} ${completedTask.error.message}`, "error");
            log("Luau task failed", "error");
            return false;
        }
    } catch (error) {
        log(`Error executing Luau task: ${error.response?.data || error.message}`, "error");
        return false;
    }
}

async function runCloudTests() {
    if (!EXECUTION_KEY || !UNIVERSE_ID || !PLACE_ID) {
        log("Skipping cloud tests: Required environment variables not set", "warn");
        log("Missing:", "warn");
        if (!EXECUTION_KEY) log("  - LUAU_EXECUTION_KEY", "warn");
        if (!UNIVERSE_ID) log("  - LUAU_EXECUTION_UNIVERSE_ID", "warn");
        if (!PLACE_ID) log("  - LUAU_EXECUTION_PLACE_ID", "warn");
        return null;
    }

    try {
        const success = await runLuauTask(UNIVERSE_ID, PLACE_ID, luauScript, PLACE_VERSION);
        return success;
    } catch (error) {
        log(`Error in cloud test execution: ${error.response?.data || error.message || error}`, "error");
        return false;
    }
}

async function main() {
    initFileLogger(PLACE_VERSION);
    log(`Test mode: ${STUDIO_TEST_MODE}`, "info");
    let studioResult = null;

    if (STUDIO_TEST_MODE !== "cloud") {
        try {
            studioResult = await runStudioTests();
        } catch (error) {
            const message = error?.message ?? String(error);
            log(`Studio test runner encountered an error: ${message}`, "error");
            studioResult = {
                success: false,
                summary: null,
                error: message,
            };
        }

        if (studioResult) {
            if (studioResult.success) {
                log("Studio tests passed", "debug");
                if (fileLogger) fileLogger.close();
                process.exit(0);
            } else {
                const reason = studioResult.error ? ` (${studioResult.error})` : "";
                log(`Studio tests failed${reason}`, "error");
                if (fileLogger) fileLogger.close();
                process.exit(1);
            }
        } else if (STUDIO_TEST_MODE === "studio") {
            log("Studio test runner was requested (STUDIO_TEST_MODE=studio) but is unavailable.", "error");
            if (fileLogger) fileLogger.close();
            process.exit(1);
        }
    }

    if (STUDIO_TEST_MODE !== "studio") {
        const cloudResult = await runCloudTests();

        if (cloudResult === true) {
            log("Cloud tests passed", "debug");
            if (fileLogger) fileLogger.close();
            process.exit(0);
        } else if (cloudResult === false) {
            log("Cloud tests failed.", "error");
            if (fileLogger) fileLogger.close();
            process.exit(1);
        } else if (STUDIO_TEST_MODE === "cloud") {
            log("Cloud tests requested, but environment variables are missing; skipping.", "warn");
            if (fileLogger) fileLogger.close();
            process.exit(0);
        }
    }

    log("No test runner executed; skipping tests.", "warn");
    if (fileLogger) fileLogger.close();
    process.exit(0);
}

main().catch((error) => {
    log(`Unhandled error during test execution: ${error}`, "error");
    if (fileLogger) fileLogger.close();
    process.exit(1);
});
