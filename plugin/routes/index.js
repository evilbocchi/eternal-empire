import { appendFile, writeFile } from "node:fs/promises";
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
}
