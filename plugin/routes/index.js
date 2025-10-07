import { appendFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFileIfChanged } from "../utils/fileUtils.js";
import { generateTypeScriptContent } from "../generators/typescriptGenerator.js";
import { applySnapshot, applyDiff } from "../datamodel/dataModelStore.js";
import { acceptSnapshotChunk, clearPendingSnapshot } from "../datamodel/snapshotAssembler.js";
import { dataModelState, connectionState } from "../state/dataModelState.js";

/**
 * Registers all Express route handlers.
 * @param {object} app - Express app instance
 * @param {object} logger - Logger instance (signale)
 * @param {string} repoRoot - Repository root path
 * @param {string} outputPath - Path to services.d.ts output file
 * @param {string} progressionOutputPath - Path to progression markdown output file
 */
export function registerRoutes(app, logger, repoRoot, outputPath, progressionOutputPath) {
    const SSE_HEARTBEAT_INTERVAL = 15000;
    const TEST_ACK_TIMEOUT_MS = 10000;
    const TEST_RUN_TIMEOUT_MS = 10 * 60 * 1000;

    const testState = {
        streamClient: null,
        heartbeatTimer: null,
        currentRun: null,
    };

    const detachStream = (reason) => {
        if (testState.heartbeatTimer) {
            globalThis.clearInterval(testState.heartbeatTimer);
            testState.heartbeatTimer = null;
        }

        const client = testState.streamClient;
        testState.streamClient = null;

        if (client) {
            try {
                if (!client.res.writableEnded) {
                    client.res.end();
                }
            } catch (error) {
                logger.warn(`Stream client cleanup error: ${error}`);
            }
        }

        if (reason) {
            logger.warn(reason);
        }
    };

    const sendSse = (eventName, payload) => {
        const client = testState.streamClient;
        if (!client) {
            return false;
        }

        try {
            client.res.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`);
            return true;
        } catch (error) {
            detachStream(`Failed to write to Studio stream (${error})`);
            return false;
        }
    };

    const normalizeRunMessage = (message) => (typeof message === "string" ? message : JSON.stringify(message));

    const appendRunLine = (message, level = "info") => {
        const run = testState.currentRun;
        if (!run || run.finished) {
            return;
        }

        const normalized = normalizeRunMessage(message);
        const line = normalized.endsWith("\n") ? normalized : `${normalized}\n`;
        run.response.write(line);

        if (level === "error") {
            logger.error(normalized);
        } else if (level === "warn") {
            logger.warn(normalized);
        } else {
            logger.info(normalized);
        }
    };

    const finalizeRun = (result) => {
        const run = testState.currentRun;
        if (!run || run.finished) {
            return;
        }

        run.finished = true;

        if (run.ackTimer) {
            globalThis.clearTimeout(run.ackTimer);
            run.ackTimer = null;
        }

        if (run.timeout) {
            globalThis.clearTimeout(run.timeout);
            run.timeout = null;
        }

        const payload = {
            success: Boolean(result?.success),
            summary: result?.summary ?? null,
            error: result?.error ?? null,
        };

        run.response.write(`\n__RESULT__ ${JSON.stringify(payload)}\n`);
        run.response.end();

        testState.currentRun = null;
    };

    const acknowledgeRun = () => {
        const run = testState.currentRun;
        if (!run || run.finished) {
            return;
        }

        if (!run.acknowledged) {
            run.acknowledged = true;
            if (run.ackTimer) {
                globalThis.clearTimeout(run.ackTimer);
                run.ackTimer = null;
            }
            logger.info("Studio acknowledged test run request.");
        }
    };

    function normalizePayload(raw) {
        if (!raw || typeof raw !== "object") {
            return null;
        }

        if (typeof raw.type === "string") {
            if (raw.type === "snapshot" && !raw.snapshot && raw.root) {
                return { ...raw, snapshot: raw.root };
            }

            return raw;
        }

        if (raw.root) {
            return { ...raw, type: "snapshot", snapshot: raw.root };
        }

        return raw;
    }

    function updateTruncationStatus(snapshot) {
        if (!snapshot || typeof snapshot !== "object") {
            return;
        }

        const truncated = snapshot.truncated === true;
        if (truncated === connectionState.lastTruncatedFlag) {
            return;
        }

        const scope = truncated ? logger.warn : logger.info;
        scope(
            `DataModel snapshot ${truncated ? "is" : "is no longer"} truncated (maxDepth=${snapshot.maxDepth ?? "?"}, maxNodes=${snapshot.maxNodes ?? "?"}).`,
        );
        connectionState.lastTruncatedFlag = truncated;
    }

    function commitSnapshotPayload(payload) {
        applySnapshot(dataModelState, payload);
        dataModelState.version = (Number(dataModelState.version) || 0) + 1;

        if (!connectionState.hasLoggedInitialSnapshot) {
            logger.success("Received initial DataModel snapshot from Roblox Studio.");
            connectionState.hasLoggedInitialSnapshot = true;
        }

        updateTruncationStatus(dataModelState.snapshot);

        return { status: "ok", version: dataModelState.version };
    }

    /**
     * POST /waypointsync
     * Receives DataModel trees and generates TypeScript service definitions.
     */
    app.post("/waypointsync", async (req, res) => {
        const body = Array.isArray(req.body) ? req.body : null;
        if (!body) {
            return res.status(400).send("Missing or invalid JSON body.");
        }

        connectionState.pluginConnected = true;

        const content = generateTypeScriptContent(body);
        try {
            const result = await writeFileIfChanged(outputPath, content, repoRoot);
            res.send(result.message);
        } catch (error) {
            logger.error(error);
            res.status(500).send(`Failed to write to ${path.relative(repoRoot, outputPath)}.`);
        }
    });

    /**
     * POST /data-model
     * Receives and stores DataModel snapshot from Roblox Studio plugin.
     */
    app.post("/data-model", (req, res) => {
        const body = typeof req.body === "object" && req.body !== null ? req.body : null;
        if (!body) {
            return res.status(400).json({ status: "error", message: "Missing data model payload." });
        }

        const payload = normalizePayload(body);
        const type = typeof payload?.type === "string" ? payload.type : "snapshot";

        connectionState.pluginConnected = true;

        if (type === "snapshot") {
            try {
                const response = commitSnapshotPayload(payload);
                clearPendingSnapshot(dataModelState);
                return res.json(response);
            } catch (error) {
                logger.error(error);
                clearPendingSnapshot(dataModelState);
                return res.status(400).json({
                    status: "error",
                    message: error?.message || "Failed to process data model snapshot.",
                });
            }
        }

        if (type === "snapshot-chunk") {
            try {
                const chunkResult = acceptSnapshotChunk(dataModelState, payload);

                if (!chunkResult.complete) {
                    return res.json({
                        status: "chunk-ack",
                        nextChunk: chunkResult.nextIndex,
                        chunkCount: chunkResult.chunkCount,
                    });
                }

                const normalizedPayload = normalizePayload(chunkResult.snapshotPayload);
                const response = commitSnapshotPayload(normalizedPayload);

                if (typeof chunkResult.totalBytes === "number" && typeof chunkResult.chunkCount === "number") {
                    logger.info(
                        `Assembled chunked DataModel snapshot (${chunkResult.totalBytes} bytes across ${chunkResult.chunkCount} chunks).`,
                    );
                }

                return res.json(response);
            } catch (error) {
                logger.warn(error);
                clearPendingSnapshot(dataModelState);
                return res.status(409).json({
                    status: "resync",
                    version: dataModelState.version || null,
                    message: error?.message || "Failed to assemble chunked snapshot.",
                });
            }
        }

        if (type === "diff") {
            if (!dataModelState.snapshot || !dataModelState.snapshot.root || !dataModelState.index) {
                return res.status(409).json({
                    status: "resync",
                    version: dataModelState.version || null,
                    message: "Server is missing a baseline snapshot.",
                });
            }

            const baseVersion = payload.baseVersion;
            if (typeof baseVersion !== "number") {
                return res.status(400).json({
                    status: "error",
                    message: "Diff payload is missing baseVersion.",
                });
            }

            if (baseVersion !== dataModelState.version) {
                return res.status(409).json({
                    status: "resync",
                    version: dataModelState.version,
                    message: `Version mismatch (expected ${dataModelState.version}, received ${baseVersion}).`,
                });
            }

            if (payload.truncated) {
                return res.status(409).json({
                    status: "resync",
                    version: dataModelState.version,
                    message: "Diff payload reported truncation.",
                });
            }

            try {
                applyDiff(dataModelState, payload);
            } catch (error) {
                logger.warn(error);
                return res.status(409).json({
                    status: "resync",
                    version: dataModelState.version,
                    message: error?.message || "Failed to apply diff; resync required.",
                });
            }

            dataModelState.version += 1;
            updateTruncationStatus(dataModelState.snapshot);

            return res.json({ status: "ok", version: dataModelState.version });
        }

        return res.status(400).json({ status: "error", message: `Unknown payload type: ${type}` });
    });

    /**
     * POST /progression-report
     * Receives progression reports from the plugin (full content or chunked).
     */
    app.post("/progression-report", async (req, res) => {
        const body = typeof req.body === "object" && req.body !== null ? req.body : {};
        const { content, chunk, isFirst, isLast } = body;

        const relativePath = path.relative(repoRoot, progressionOutputPath);

        if (typeof content === "string" && content.length > 0) {
            const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
            try {
                const result = await writeFileIfChanged(progressionOutputPath, normalizedContent, repoRoot);
                return res.send(result.message);
            } catch (error) {
                logger.error(error);
                return res.status(500).send(`Failed to write to ${relativePath}.`);
            }
        }

        if (typeof chunk === "string" && chunk.length > 0) {
            try {
                if (isFirst) {
                    await writeFile(progressionOutputPath, chunk);
                } else {
                    await appendFile(progressionOutputPath, chunk);
                }

                if (isLast && !chunk.endsWith("\n")) {
                    await appendFile(progressionOutputPath, "\n");
                }

                return res.send(`Chunk received for ${relativePath}`);
            } catch (error) {
                logger.error(error);
                return res.status(500).send(`Failed to write chunk to ${relativePath}.`);
            }
        }

        return res.status(400).send("Missing progression report content.");
    });

    app.get("/test/stream", (req, res) => {
        res.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        if (testState.streamClient && testState.streamClient.res !== res) {
            detachStream();
        }

        testState.streamClient = { res };

        if (testState.heartbeatTimer) {
            globalThis.clearInterval(testState.heartbeatTimer);
        }

        testState.heartbeatTimer = globalThis.setInterval(() => {
            const client = testState.streamClient;
            if (!client) {
                return;
            }

            try {
                client.res.write(`: heartbeat ${Date.now()}\n\n`);
            } catch (error) {
                detachStream(`Studio stream heartbeat failed (${error})`);
            }
        }, SSE_HEARTBEAT_INTERVAL);

        connectionState.pluginConnected = true;
        logger.info("Studio test runner connected.");
        res.write("event: connected\ndata: {}\n\n");

        req.on("close", () => {
            if (testState.streamClient && testState.streamClient.res === res) {
                detachStream("Studio test runner disconnected.");
            }
        });
    });

    app.get("/test/status", (_req, res) => {
        const run = testState.currentRun;
        res.json({
            streamConnected: Boolean(testState.streamClient),
            runId: run && !run.finished ? run.id : null,
        });
    });

    app.post("/test/status", (req, res) => {
        const body = typeof req.body === "object" && req.body !== null ? req.body : {};
        const { runId, phase, message } = body;

        if (!runId) {
            if (typeof phase === "string") {
                logger.info(`Studio status: ${phase}`);
            }
            return res.json({ status: "ok" });
        }

        const run = testState.currentRun;
        if (!run || run.id !== runId || run.finished) {
            return res.json({ status: "ignored" });
        }

        acknowledgeRun();

        if (typeof message === "string" && message.length > 0) {
            appendRunLine(message);
        } else if (typeof phase === "string") {
            appendRunLine(`[Studio] ${phase}`);
        }

        return res.json({ status: "ok" });
    });

    app.post("/test/run", (req, res) => {
        if (!testState.streamClient) {
            return res.status(503).json({ status: "error", message: "Studio plugin is not connected." });
        }

        const runId = randomUUID();

        res.set({
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
        });

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        testState.currentRun = {
            id: runId,
            response: res,
            startedAt: Date.now(),
            acknowledged: false,
            finished: false,
            ackTimer: globalThis.setTimeout(() => {
                appendRunLine("Studio did not acknowledge the test run request within 10 seconds.", "error");
                finalizeRun({ success: false, error: "no-acknowledgement" });
            }, TEST_ACK_TIMEOUT_MS),
            timeout: globalThis.setTimeout(() => {
                appendRunLine("Studio test run timed out after 10 minutes.", "error");
                finalizeRun({ success: false, error: "timeout" });
            }, TEST_RUN_TIMEOUT_MS),
            logStreamed: false,
        };

        if (!sendSse("run-tests", { runId })) {
            appendRunLine("Failed to signal Studio plugin to start tests.", "error");
            finalizeRun({ success: false, error: "stream-write-failed" });
            return;
        }
    });

    app.post("/test/log", (req, res) => {
        const body = typeof req.body === "object" && req.body !== null ? req.body : {};
        const { runId, message, level } = body;

        const run = testState.currentRun;
        if (!run || run.id !== runId || run.finished) {
            return res.json({ status: "ignored" });
        }

        acknowledgeRun();

        if (typeof message === "string" && message.length > 0) {
            run.logStreamed = true;
            appendRunLine(message, level);
        }

        return res.json({ status: "ok" });
    });

    app.post("/test/result", (req, res) => {
        const body = typeof req.body === "object" && req.body !== null ? req.body : {};
        const { runId, success, summary, lines, errors, exception, prints } = body;

        const run = testState.currentRun;
        if (!run || run.id !== runId || run.finished) {
            return res.status(409).json({ status: "error", message: "No active run matches the provided runId." });
        }

        acknowledgeRun();

        const shouldReplayBufferedOutput = !run.logStreamed;

        if (shouldReplayBufferedOutput && Array.isArray(prints)) {
            for (const entry of prints) {
                if (typeof entry === "string" && entry.length > 0) {
                    appendRunLine(entry);
                }
            }
        }

        if (shouldReplayBufferedOutput && Array.isArray(lines)) {
            for (const entry of lines) {
                if (typeof entry === "string" && entry.length > 0) {
                    appendRunLine(entry);
                }
            }
        }

        if (Array.isArray(errors)) {
            for (const entry of errors) {
                if (typeof entry === "string" && entry.length > 0) {
                    appendRunLine(entry, "error");
                }
            }
        }

        if (typeof exception === "string" && exception.length > 0) {
            appendRunLine(exception, "error");
        }

        finalizeRun({
            success: Boolean(success),
            summary: summary ?? null,
            error: typeof exception === "string" ? exception : null,
        });

        return res.json({ status: "ok" });
    });
}
