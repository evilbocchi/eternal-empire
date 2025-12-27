/* global setTimeout setInterval clearInterval */

import express from "express";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import signalePkg from "signale";
import { generateTypeScriptContent } from "./generators/typescriptGenerator.js";
import { writeFileIfChanged } from "./utils/fileUtils.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

const { Signale } = signalePkg;
const logger = new Signale({
    stream: process.stderr,
});

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const OUTPUT = path.resolve(REPO_ROOT, "src/services.d.ts");

/**
 * GET /live/stream
 * SSE endpoint for live syncer - server sends refresh commands to client.
 */
app.get("/live/stream", (req, res) => {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
    }

    logger.info("plugin.live connected to Roblox Studio");

    // Send initial connection confirmation
    res.write(": connected\n\n");

    // Send initial refresh command
    setTimeout(() => {
        res.write("data: refresh\n\n");
    }, 500);

    // Periodically request updates from plugin
    const REFRESH_INTERVAL = 2000; // 2 seconds
    const refreshInterval = setInterval(() => {
        if (res.writableEnded) {
            clearInterval(refreshInterval);
            return;
        }
        res.write("data: refresh\n\n");
    }, REFRESH_INTERVAL);

    req.on("close", () => {
        clearInterval(refreshInterval);
        logger.info("plugin.live disconnected from Roblox Studio");
    });

    req.on("error", (error) => {
        clearInterval(refreshInterval);
        logger.error(`plugin.live stream error: ${error}`);
    });
});

/**
 * POST /live/data
 * Receives live data from Studio plugin.
 */
app.post("/live/data", async (req, res) => {
    const waypoints = req.body.waypoints;
    if (waypoints) {
        // Save TypeScript definitions
        try {
            const result = await writeFileIfChanged(OUTPUT, generateTypeScriptContent(waypoints), REPO_ROOT);
            res.send(result.message);
        } catch (error) {
            logger.error(error);
            res.status(500).send(`Failed to write to ${path.relative(REPO_ROOT, OUTPUT)}.`);
        }
    }

    const save = req.body.save;
    if (save) {
        // Save to json
        const savePath = path.resolve(REPO_ROOT, "saves", "latest.json");
        try {
            const result = await writeFileIfChanged(savePath, JSON.stringify(save, null, 4), REPO_ROOT);
            res.send(result.message);
        } catch (error) {
            logger.error(error);
            res.status(500).send(`Failed to write to ${path.relative(REPO_ROOT, savePath)}.`);
        }
    }
});

// Start Express server
const PORT = 28354;
app.listen(PORT, () => {
    logger.info(`plugin.live server running at http://localhost:${PORT}`);
});
