import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import readline from "readline";
import path from "path";
import signale from "signale";

const logger = new signale.Signale();

dotenv.config();

// Add default headers to all axios requests to help avoid WAF blocks
axios.defaults.headers.common["User-Agent"] = "Node.js/Roblox-Test-Runner";

// Accept mode from command-line argument, fallback to env var
let cliMode = null;
for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--mode=")) {
        cliMode = arg.slice("--mode=".length).toLowerCase();
    }
}
const STUDIO_TEST_MODE = (cliMode ?? process.env.STUDIO_TEST_MODE ?? "auto").toLowerCase();
const STUDIO_TEST_SERVER = process.env.STUDIO_TEST_SERVER ?? "http://localhost:28354";
const parsedTimeout = Number.parseInt(process.env.STUDIO_REQUEST_TIMEOUT ?? "5000", 10);
const STUDIO_REQUEST_TIMEOUT = Number.isFinite(parsedTimeout) ? parsedTimeout : 5000;
const parsedStudioToolTimeout = Number.parseInt(process.env.STUDIO_TOOL_TIMEOUT_MS ?? "120000", 10);
const STUDIO_TOOL_TIMEOUT_MS = Number.isFinite(parsedStudioToolTimeout) ? parsedStudioToolTimeout : 120000;

const EXECUTION_KEY = process.env.LUAU_EXECUTION_KEY;
const UNIVERSE_ID = process.env.LUAU_EXECUTION_UNIVERSE_ID;
const PLACE_ID = process.env.LUAU_EXECUTION_PLACE_ID;

const scriptPath = path.join(import.meta.dirname, "invoker.lua");

console.log(`Reading Luau script from: ${scriptPath}`);
const luauScript = fs.readFileSync(scriptPath, "utf8");

function transformLuauPath(line) {
    // Transform Luau stack trace paths to source TypeScript paths for clickability
    // e.g., [string "ServerScriptService.tests.weather.spec"]:15 -> src/server/tests/weather.spec.ts:15
    const match = line.match(/\[string "ServerScriptService\.tests\.([^"]+)"\]:\s*(\d+)/);
    if (match) {
        const file = match[1];
        const lineNum = match[2];
        return line.replace(/\[string "ServerScriptService\.tests\.[^"]+"\]:\s*\d+/, `out/server/tests/${file}.luau:${lineNum}`);
    }
    return line;
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
        logger.info(
            `Studio summary: ${passed} passed, ${failed} failed, ${skipped} skipped over ${summary.totalTests ?? "?"} tests.`,
        );
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
            error: combinedFailures.length > 0 ? combinedFailures : baseError ?? "Studio tests reported failures.",
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
                console.log(transformLuauPath(trimmed));
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
                } else if (level === "warn") {
                    console.warn(transformed);
                } else {
                    console.log(transformed);
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
    logger.info(`Checking Studio MCP server at ${STUDIO_TEST_SERVER}`);

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
            logger.warn("Studio MCP server reachable but plugin is not connected; skipping Studio tests.");
            return null;
        }

        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
            logger.warn(`Studio MCP server not reachable (${error.code}); skipping Studio tests.`);
            return null;
        }

        if (status === 404) {
            logger.warn("Studio MCP server does not expose the run_tests tool yet; skipping Studio tests.");
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

            console.log(transformLuauPath(line));
            updateFailureDetection(line, tracker);
        }
    }

    return analyzeStudioResultPayload(result, tracker.detectedFailures);
}

async function createTask(apiKey, scriptContents, universeId, placeId) {
    try {
        const response = await axios({
            method: "post",
            url: `https://apis.roblox.com/cloud/v2/universes/${universeId}/places/${placeId}/luau-execution-session-tasks`,
            data: {
                script: scriptContents,
                timeout: "3s",
            },
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        logger.error("Error creating task:");
        logger.error("Status:", error.response?.status);
        logger.error("Status Text:", error.response?.statusText);
        logger.error("Data:", error.response?.data);
        logger.error("Request URL:", error.config?.url);
        if (error.response?.status === 403) {
            logger.error("This may be a WAF blocked request or authentication issue");
        }
        throw error;
    }
}

async function pollForTaskCompletion(apiKey, taskPath) {
    let task = null;

    while (!task || (task.state !== "COMPLETE" && task.state !== "FAILED")) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            logger.info(`Polling task status at: https://apis.roblox.com/${taskPath}`);
            const response = await axios.get(`https://apis.roblox.com/cloud/v2/${taskPath}`, {
                headers: {
                    "x-api-key": apiKey,
                },
            });

            task = response.data;
            console.log(`Task state: ${task.state}`);
        } catch (error) {
            logger.warn("Error polling task completion:");
            logger.warn("Status:", error.response?.status);
            logger.warn("Data:", error.response?.data);
            if (error.response?.status === 403) {
                logger.warn("WAF may be blocking polling requests");
            }
        }
    }

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
        logger.error("Error getting task logs:");
        logger.error("Status:", error.response?.status);
        logger.error("Data:", error.response?.data);
        if (error.response?.status === 403) {
            logger.error("WAF may be blocking log retrieval requests");
        }
        throw error;
    }
}

async function runLuauTask(universeId, placeId, scriptContents) {
    logger.info("Executing Luau task");

    try {
        const task = await createTask(EXECUTION_KEY, scriptContents, universeId, placeId);
        logger.info(`Created task: ${task.path}`);

        const completedTask = await pollForTaskCompletion(EXECUTION_KEY, task.path);
        const logs = await getTaskLogs(EXECUTION_KEY, task.path);

        let failedTests = 0;
        let totalTests = 0;

        for (const taskLogs of logs.luauExecutionSessionTaskLogs) {
            const messages = taskLogs.messages;
            for (const message of messages) {
                logger.info(transformLuauPath(message));

                // Check for test result summary line (e.g., "36 passed, 0 failed, 0 skipped")
                const testResultMatch = message.match(/(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped/);
                if (testResultMatch) {
                    const passed = parseInt(testResultMatch[1]);
                    const failed = parseInt(testResultMatch[2]);
                    const skipped = parseInt(testResultMatch[3]);

                    failedTests += failed;
                    totalTests += passed + failed + skipped;
                }
            }
        }

        if (completedTask.state === "COMPLETE") {
            if (failedTests > 0) {
                logger.error(`Luau task completed but ${failedTests} test(s) failed`);
                return false;
            } else {
                logger.info("Luau task completed successfully with all tests passing");
                return true;
            }
        } else {
            logger.error("Luau task failed");
            return false;
        }
    } catch (error) {
        logger.error("Error executing Luau task:", error.response?.data || error.message);
        return false;
    }
}

async function runCloudTests() {
    if (!EXECUTION_KEY || !UNIVERSE_ID || !PLACE_ID) {
        logger.warn("Skipping cloud tests: Required environment variables not set");
        logger.warn("Missing:");
        if (!EXECUTION_KEY) logger.warn("  - LUAU_EXECUTION_KEY");
        if (!UNIVERSE_ID) logger.warn("  - LUAU_EXECUTION_UNIVERSE_ID");
        if (!PLACE_ID) logger.warn("  - LUAU_EXECUTION_PLACE_ID");
        return null;
    }

    try {
        const success = await runLuauTask(UNIVERSE_ID, PLACE_ID, luauScript);
        return success;
    } catch (error) {
        logger.error("Error in cloud test execution:", error.response?.data || error.message || error);
        return false;
    }
}

async function main() {
    logger.info(`Test mode: ${STUDIO_TEST_MODE}`);
    let studioResult = null;

    if (STUDIO_TEST_MODE !== "cloud") {
        try {
            studioResult = await runStudioTests();
        } catch (error) {
            const message = error?.message ?? String(error);
            logger.error(`Studio test runner encountered an error: ${message}`);
            studioResult = {
                success: false,
                summary: null,
                error: message,
            };
        }

        if (studioResult) {
            if (studioResult.success) {
                process.exit(0);
            } else {
                const reason = studioResult.error ? ` (${studioResult.error})` : "";
                logger.error(`Studio tests failed${reason}`);
                process.exit(1);
            }
        } else if (STUDIO_TEST_MODE === "studio") {
            logger.error("Studio test runner was requested (STUDIO_TEST_MODE=studio) but is unavailable.");
            process.exit(1);
        }
    }

    if (STUDIO_TEST_MODE !== "studio") {
        const cloudResult = await runCloudTests();

        if (cloudResult === true) {
            logger.success("Cloud tests passed successfully.");
            process.exit(0);
        } else if (cloudResult === false) {
            logger.error("Cloud tests failed.");
            process.exit(1);
        } else if (STUDIO_TEST_MODE === "cloud") {
            logger.warn("Cloud tests requested, but environment variables are missing; skipping.");
            process.exit(0);
        }
    }

    logger.warn("No test runner executed; skipping tests.");
    process.exit(0);
}

main().catch((error) => {
    logger.error("Unhandled error during test execution:", error);
    process.exit(1);
});
