#!/usr/bin/env node

import express from "express";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import signalePkg from "signale";
import { startMcpServer } from "./mcp/mcpServer.js";
import { initToolBridge } from "./mcp/toolBridge.js";
import { registerRoutes } from "./routes/index.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

const { Signale } = signalePkg;
const logger = new Signale({
    stream: process.stderr,
});

initToolBridge(logger);

// Configuration
const PORT = 28354;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.resolve(REPO_ROOT, "src/services.d.ts");
const PROGRESSION_OUTPUT = path.resolve(REPO_ROOT, "PROGRESS_ESTIMATION.md");

// Register Express routes
registerRoutes(app, logger, REPO_ROOT, OUTPUT, PROGRESSION_OUTPUT);

// Start Express server
app.listen(PORT, () => {
    logger.info(`Plugin server running at http://localhost:${PORT}`);
});

// Start MCP server
startMcpServer(logger).catch((error) => {
    logger.error("Failed to start MCP server:", error);
    process.exit(1);
});
