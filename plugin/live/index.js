#!/usr/bin/env node

import express from "express";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import signalePkg from "signale";
import { registerRoutes } from "./routes/index.js";
import { attachDataModelSocket } from "./routes/dataModelSocket.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

const { Signale } = signalePkg;
const logger = new Signale({
    stream: process.stderr,
});

// Configuration
const PORT = 28354;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.resolve(REPO_ROOT, "src/services.d.ts");

// Register Express routes
registerRoutes(app, logger, REPO_ROOT, OUTPUT);

// Start Express server
const server = app.listen(PORT, () => {
    logger.info(`plugin.live server running at http://localhost:${PORT}`);
});

// Attach WebSocket bridge for DataModel sync
attachDataModelSocket(server, logger);
