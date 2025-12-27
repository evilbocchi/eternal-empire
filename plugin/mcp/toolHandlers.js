import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import {
    isStreamConnected as isMcpStreamConnected,
    requestToolExecution as requestMcpToolExecution,
} from "./toolBridge.js";

export const WAIT_FOR_PLUGIN_TIMEOUT_MS = 4000;
export const WAIT_FOR_PLUGIN_TIMEOUT_SECONDS = WAIT_FOR_PLUGIN_TIMEOUT_MS / 1000;
const WAIT_FOR_PLUGIN_POLL_MS = 200;

export const MCP_TOOL_DEFINITIONS = [
    {
        name: "list_instances",
        description: "List Roblox Studio DataModel instances captured by the companion plugin.",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description:
                        "Dot path to the starting instance (e.g. game.Workspace.MyFolder). Defaults to the DataModel root.",
                },
                maxDepth: {
                    type: "number",
                    description: "Number of descendant levels to include (0 = node only). Defaults to 3.",
                },
            },
        },
    },
    {
        name: "find_item_model",
        description:
            "Search for an item model by name in the ItemModels folder and return its structure with children.",
        inputSchema: {
            type: "object",
            properties: {
                itemName: {
                    type: "string",
                    description: "The name of the item model to search for (e.g. 'Conveyor', 'BasicDropper').",
                },
                maxDepth: {
                    type: "number",
                    description: "Number of descendant levels to include (0 = model only). Defaults to 5.",
                },
            },
            required: ["itemName"],
        },
    },
    {
        name: "execute_luau",
        description:
            "Execute a Luau snippet inside the Roblox Studio tooling plugin and capture its output and return values.",
        inputSchema: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "Luau source code to execute within the Studio plugin context.",
                },
                timeoutMs: {
                    type: "number",
                    description:
                        "Optional timeout in milliseconds for the plugin execution request (defaults to 30000, max 120000).",
                },
            },
            required: ["code"],
        },
    },
];

export function statusForMcpErrorCode(code) {
    switch (code) {
        case ErrorCode.InvalidRequest:
            return 400;
        case ErrorCode.MethodNotFound:
            return 404;
        case ErrorCode.FailedPrecondition:
            return 503;
        case ErrorCode.DeadlineExceeded:
            return 504;
        default:
            return 500;
    }
}

function createMcpError(code, message, overrideStatus) {
    const httpStatus = overrideStatus ?? statusForMcpErrorCode(code);
    return new McpError(code, message, { httpStatus });
}

export async function waitForPluginConnection(timeoutMs = WAIT_FOR_PLUGIN_TIMEOUT_MS) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        if (isMcpStreamConnected()) {
            return true;
        }

        await new Promise((resolve) => globalThis.setTimeout(resolve, WAIT_FOR_PLUGIN_POLL_MS));
    }

    return isMcpStreamConnected();
}

async function ensureMcpConnectionOrThrow(reason) {
    if (isMcpStreamConnected()) {
        return;
    }

    const connected = await waitForPluginConnection();
    if (!connected || !isMcpStreamConnected()) {
        throw createMcpError(
            ErrorCode.FailedPrecondition,
            `Studio MCP client is not connected after waiting ${WAIT_FOR_PLUGIN_TIMEOUT_SECONDS} seconds. ${reason}`,
            statusForMcpErrorCode(ErrorCode.FailedPrecondition),
        );
    }
}

function wrapToolExecutionError(error) {
    const message = typeof error?.message === "string" ? error.message : String(error);
    let code = ErrorCode.InternalError;

    if (/not connected/i.test(message)) {
        code = ErrorCode.FailedPrecondition;
    } else if (/timed out/i.test(message)) {
        code = ErrorCode.DeadlineExceeded;
    }

    throw createMcpError(code, message);
}

export async function executeMcpTool(name, rawArgs, options = {}) {
    const args = typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {};
    const { onProgress } = options;

    switch (name) {
        case "list_instances": {
            await ensureMcpConnectionOrThrow("Launch Roblox Studio with the tooling plugin to list instances.");

            const requestArgs = {};
            if (typeof args.path === "string" && args.path.trim().length > 0) {
                requestArgs.path = args.path.trim();
            }

            const maxDepthArg = Number(args.maxDepth);
            if (Number.isFinite(maxDepthArg) && maxDepthArg >= 0) {
                requestArgs.maxDepth = Math.floor(maxDepthArg);
            }

            try {
                return await requestMcpToolExecution("list_instances", requestArgs);
            } catch (error) {
                wrapToolExecutionError(error);
            }

            return null;
        }
        case "find_item_model": {
            const itemName = typeof args.itemName === "string" ? args.itemName.trim() : "";
            if (itemName.length === 0) {
                throw createMcpError(ErrorCode.InvalidRequest, "itemName parameter must be a non-empty string", 400);
            }

            await ensureMcpConnectionOrThrow("Launch Roblox Studio with the tooling plugin to search for item models.");

            const requestArgs = { itemName };
            const maxDepthArg = Number(args.maxDepth);
            if (Number.isFinite(maxDepthArg) && maxDepthArg >= 0) {
                requestArgs.maxDepth = Math.floor(maxDepthArg);
            }

            try {
                return await requestMcpToolExecution("find_item_model", requestArgs);
            } catch (error) {
                wrapToolExecutionError(error);
            }

            return null;
        }
        case "execute_luau": {
            const code = typeof args.code === "string" ? args.code : "";
            if (code.trim().length === 0) {
                throw createMcpError(ErrorCode.InvalidRequest, "code parameter must be a non-empty string", 400);
            }

            await ensureMcpConnectionOrThrow("Launch Roblox Studio with the tooling plugin to enable Luau execution.");

            const requestArgs = { code };
            const timeoutArg = Number(args.timeoutMs);
            const executionOptions = {};
            if (Number.isFinite(timeoutArg) && timeoutArg > 0) {
                executionOptions.timeoutMs = Math.min(Math.floor(timeoutArg), 120000);
            }

            if (typeof onProgress === "function") {
                executionOptions.onProgress = onProgress;
            }

            try {
                return await requestMcpToolExecution("execute_luau", requestArgs, executionOptions);
            } catch (error) {
                wrapToolExecutionError(error);
            }

            return null;
        }
        default:
            throw createMcpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`, 404);
    }
}
