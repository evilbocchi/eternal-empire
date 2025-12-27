import { McpError } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import process from "node:process";
import signalePkg from "signale";
import { attachDataModelSocket } from "./datamodel/dataModelSocket.js";
import { startMcpServer } from "./mcpServer.js";
import {
    connectStream as connectMcpStream,
    disconnectStream as disconnectMcpStream,
    handleToolProgress as handleMcpToolProgress,
    handleToolResponse as handleMcpToolResponse,
    initToolBridge,
} from "./toolBridge.js";
import { MCP_TOOL_DEFINITIONS, executeMcpTool, statusForMcpErrorCode } from "./toolHandlers.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

const { Signale } = signalePkg;
const logger = new Signale({
    stream: process.stderr,
});

initToolBridge(logger);

/**
 * GET /mcp/stream
 * SSE endpoint for MCP tool calls from Roblox Studio plugin.
 */
app.get("/mcp/stream", (req, res) => {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
    }

    connectMcpStream(res);

    req.on("close", () => {
        disconnectMcpStream("Studio MCP client disconnected.", res);
    });
});

app.post("/mcp/tool-response", (req, res) => {
    const body = typeof req.body === "object" && req.body !== null ? req.body : {};

    if (!handleMcpToolResponse(body)) {
        return res.status(404).json({ status: "ignored" });
    }

    return res.json({ status: "ok" });
});

app.post("/mcp/tool-progress", (req, res) => {
    const body = typeof req.body === "object" && req.body !== null ? req.body : {};

    if (!handleMcpToolProgress(body)) {
        return res.json({ status: "ignored" });
    }

    return res.json({ status: "ok" });
});

/**
 * POST /mcp/call-tool
 * Handle MCP tool call from Studio plugin.
 */
app.post("/mcp/call-tool", async (req, res) => {
    const body = typeof req.body === "object" && req.body !== null ? req.body : {};
    const { name, arguments: rawArgs } = body;

    if (typeof name !== "string") {
        return res.status(400).json({ error: "Missing tool name" });
    }

    const args = typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {};
    const streamQuery = typeof req.query?.stream === "string" ? req.query.stream.toLowerCase() : "";
    const streamHeader =
        typeof req.headers["x-mcp-stream-logs"] === "string"
            ? String(req.headers["x-mcp-stream-logs"]).toLowerCase()
            : "";

    const wantsStream =
        streamQuery === "1" || streamQuery === "true" || streamHeader === "1" || streamHeader === "true";

    if (wantsStream) {
        let closed = false;

        res.status(200);
        res.set({
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
        });

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        res.on("close", () => {
            closed = true;
        });

        let sequence = 0;
        const onProgress = (payload) => {
            if (closed) {
                return;
            }

            const message = typeof payload.message === "string" ? payload.message : "";
            if (message.length === 0) {
                return;
            }

            const level = typeof payload.level === "string" ? payload.level : "info";
            const timestamp = Number.isFinite(payload.timestamp) ? payload.timestamp : Date.now();

            const event = {
                type: "log",
                seq: ++sequence,
                level,
                message,
                timestamp,
            };

            try {
                res.write(`${JSON.stringify(event)}\n`);
            } catch (error) {
                closed = true;
                logger.warn(`[MCP HTTP] Failed to stream log event: ${error}`);
            }
        };

        try {
            const result = await executeMcpTool(name, args, {
                logger,
                logPrefix: "[MCP HTTP]",
                onProgress,
            });

            if (!closed) {
                res.write(`${JSON.stringify({ type: "result", result })}\n`);
                res.end();
            }
        } catch (error) {
            let status = 500;
            let message = typeof error?.message === "string" ? error.message : String(error);

            if (error instanceof McpError) {
                status =
                    typeof error.data?.httpStatus === "number"
                        ? error.data.httpStatus
                        : statusForMcpErrorCode(error.code);
                message = error.message;

                if (status >= 500) {
                    logger.error(`[MCP HTTP] ${message}`);
                }
            } else {
                logger.error(`[MCP HTTP] Unexpected error: ${message}`);
            }

            if (!closed) {
                if (!res.headersSent || res.statusCode === 200) {
                    res.status(status);
                }
                res.write(`${JSON.stringify({ type: "error", error: message, status })}\n`);
                res.end();
            }
        }

        return;
    }

    try {
        const result = await executeMcpTool(name, args, { logger, logPrefix: "[MCP HTTP]" });
        return res.json({ success: true, result });
    } catch (error) {
        if (error instanceof McpError) {
            const status =
                typeof error.data?.httpStatus === "number" ? error.data.httpStatus : statusForMcpErrorCode(error.code);

            if (status >= 500) {
                logger.error(`[MCP HTTP] ${error.message}`);
            }

            return res.status(status).json({ error: error.message });
        }

        const message = typeof error?.message === "string" ? error.message : String(error);
        logger.error(`[MCP HTTP] Unexpected error: ${message}`);
        return res.status(500).json({ error: message });
    }
});

/**
 * GET /mcp/tools
 * List available MCP tools.
 */
app.get("/mcp/tools", (_req, res) => {
    res.json({ tools: MCP_TOOL_DEFINITIONS });
});

// Start Express server
const PORT = 28355;
const server = app.listen(PORT, () => {
    logger.info(`plugin.mcp server running at http://localhost:${PORT}`);

    // Start MCP server
    startMcpServer(logger)
        .then((tools) => {
            logger.info(`Tools: ${tools.map((tool) => tool.name).join(", ")}`);
        })
        .catch((error) => {
            logger.error("Failed to start MCP server:", error);
            process.exit(1);
        });
});

// Attach WebSocket bridge for DataModel sync
attachDataModelSocket(server, logger);
