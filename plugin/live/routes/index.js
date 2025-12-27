import path from "node:path";
import { processDataModelPayload } from "../datamodel/dataModelController.js";
import { generateTypeScriptContent } from "../generators/typescriptGenerator.js";

import { connectionState } from "../state/dataModelState.js";
import { writeFileIfChanged } from "../utils/fileUtils.js";

/**
 * Registers all Express route handlers.
 * @param {object} app - Express app instance
 * @param {object} logger - Logger instance (signale)
 * @param {string} repoRoot - Repository root path
 * @param {string} outputPath - Path to services.d.ts output file
 */
export function registerRoutes(app, logger, repoRoot, outputPath) {
    /**
     * GET /waypoint/stream
     * SSE endpoint for waypoint syncer - server can send refresh commands to client.
     */
    app.get("/waypoint/stream", (req, res) => {
        res.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        connectionState.pluginConnected = true;
        logger.info("Waypoint syncer connected.");

        // Send initial connection confirmation
        res.write(": connected\n\n");

        req.on("close", () => {
            logger.info("Waypoint syncer disconnected.");
        });

        req.on("error", (error) => {
            logger.error(`Waypoint stream error: ${error}`);
        });
    });

    /**
     * POST /waypoint/data
     * Receives waypoint data from Studio plugin.
     */
    app.post("/waypoint/data", async (req, res) => {
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
     * POST /waypointsync
     * Legacy endpoint - kept for backwards compatibility.
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

        const response = processDataModelPayload(body, logger);

        if (response.status === "error") {
            return res.status(400).json(response);
        }

        if (response.status === "resync") {
            return res.status(409).json(response);
        }

        return res.json(response);
    });
}
