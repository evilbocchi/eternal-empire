import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import readline from "readline";
import signale from "signale";
import { runCloudLuau } from "./cloudLuauRunner.js";
import {
    buildModulePathLookup,
    createLuauPathTransformer,
    createModulePathResolver,
} from "./luauPathUtils.js";

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
    //const logFileName = version ? `test_${version}.log` : `test_latest.log`;
    const logFileName = `test_run.log`;
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

const scriptPath = path.join(import.meta.dirname, "scripts", "invokeTestRunner.luau");

log(`Reading Luau script from: ${scriptPath}`, "debug");
const luauScript = fs.readFileSync(scriptPath, "utf8");

const repoRoot = path.join(import.meta.dirname, "..");
const modulePathLookup = buildModulePathLookup(repoRoot);
const resolveModulePath = createModulePathResolver(modulePathLookup);
const transformLuauPath = createLuauPathTransformer(resolveModulePath);

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
        const cloudResult = await runCloudLuau(scriptPath, {
            scriptContents: luauScript,
            placeVersion: PLACE_VERSION,
            log,
            transform: transformLuauPath,
        });

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
