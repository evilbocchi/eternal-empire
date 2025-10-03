import { appendFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { writeFileIfChanged } from "../utils/fileUtils.js";
import { generateTypeScriptContent } from "../generators/typescriptGenerator.js";
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
        const payload = typeof req.body === "object" && req.body !== null ? req.body : null;
        if (!payload || typeof payload.root !== "object") {
            return res.status(400).send("Missing data model snapshot.");
        }

        dataModelState.snapshot = payload;
        dataModelState.updatedAt = Date.now();
        connectionState.pluginConnected = true;

        if (!connectionState.hasLoggedInitialSnapshot) {
            logger.success("Received initial DataModel snapshot from Roblox Studio.");
            connectionState.hasLoggedInitialSnapshot = true;
        }

        if (payload.truncated !== connectionState.lastTruncatedFlag) {
            const scope = payload.truncated ? logger.warn : logger.info;
            scope(
                `DataModel snapshot ${payload.truncated ? "is" : "is no longer"} truncated (maxDepth=${payload.maxDepth ?? "?"}, maxNodes=${payload.maxNodes ?? "?"}).`,
            );
            connectionState.lastTruncatedFlag = payload.truncated ?? null;
        }

        return res.send("Data model snapshot received.");
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
