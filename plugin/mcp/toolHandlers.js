import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { dataModelState, connectionState } from "../state/dataModelState.js";
import { normalizePathSegments, findNodeBySegments, cloneNodeLimited } from "../datamodel/datamodelUtils.js";
import {
    isStreamConnected as isMcpStreamConnected,
    requestToolExecution as requestMcpToolExecution,
} from "./toolBridge.js";

export const WAIT_FOR_PLUGIN_TIMEOUT_MS = 4000;
export const WAIT_FOR_PLUGIN_TIMEOUT_SECONDS = WAIT_FOR_PLUGIN_TIMEOUT_MS / 1000;
const WAIT_FOR_PLUGIN_POLL_MS = 200;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const INVOKER_PATH = path.resolve(REPO_ROOT, "test", "invoker.lua");

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
    {
        name: "run_tests",
        description: "Run tests using `shared/hamster/runTests`.",
        inputSchema: {
            type: "object",
            properties: {
                timeoutMs: {
                    type: "number",
                    description:
                        "Optional timeout in milliseconds for the plugin execution request (defaults to 30000, max 120000).",
                },
            },
        },
    },
    {
        name: "estimate_item_progression",
        description:
            "Calculate time-to-obtain details for a single item using the ProgressionEstimationService simulation.",
        inputSchema: {
            type: "object",
            properties: {
                itemId: {
                    type: "string",
                    description: "The unique item id from shared/items/Items to estimate progression for.",
                },
            },
            required: ["itemId"],
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

async function readInvokerScript() {
    try {
        return await fs.readFile(INVOKER_PATH, "utf8");
    } catch (error) {
        const message = typeof error?.message === "string" ? error.message : String(error);
        throw createMcpError(ErrorCode.InternalError, `Failed to read invoker.lua: ${message}`);
    }
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

function getSnapshotOrThrow() {
    const snapshot = dataModelState.snapshot;
    if (!snapshot) {
        const message = connectionState.pluginConnected
            ? "Awaiting first DataModel snapshot from the Roblox Studio plugin."
            : "Plugin connection not detected. Launch Roblox Studio with the tooling plugin to populate the DataModel snapshot.";
        throw createMcpError(ErrorCode.FailedPrecondition, message, 503);
    }

    return snapshot;
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

function findModelRecursive(node, targetName) {
    if (!node) {
        return null;
    }

    if (node.name === targetName && (node.className === "Model" || node.className === "Folder")) {
        return node;
    }

    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            const result = findModelRecursive(child, targetName);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

export async function executeMcpTool(name, rawArgs, options = {}) {
    const args = typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {};
    const { logger, logPrefix = "[MCP]", onProgress } = options;

    switch (name) {
        case "list_instances": {
            const snapshot = getSnapshotOrThrow();
            const pathArg = typeof args.path === "string" ? args.path : "game";
            const segments = normalizePathSegments(pathArg);

            const maxDepthArg = Number(args.maxDepth);
            let maxDepth = 3;
            if (Number.isFinite(maxDepthArg)) {
                maxDepth = Math.max(0, Math.min(Math.floor(maxDepthArg), 10));
            }

            const lookup = findNodeBySegments(snapshot.root, segments);

            if (!lookup.node) {
                const attemptedPath = segments.slice(0, lookup.missingIndex + 1).join(".");
                let message = `No instance found at path ${attemptedPath}.`;

                if (lookup.parent) {
                    const parentDisplay = lookup.parent.path ?? lookup.parent.name ?? "parent";
                    const parentTruncated = Boolean(
                        lookup.parent.truncated ||
                            (typeof lookup.parent.childCount === "number" &&
                                typeof lookup.parent.totalChildren === "number" &&
                                lookup.parent.childCount < lookup.parent.totalChildren),
                    );

                    if (parentTruncated) {
                        message += ` The parent node (${parentDisplay}) was truncated in the last snapshot; try requesting a shallower path or waiting for the next sync.`;
                    }
                }

                if (logger?.warn) {
                    logger.warn(`${logPrefix} Lookup failed: ${message}`);
                }

                throw createMcpError(ErrorCode.InvalidRequest, message, 404);
            }

            const { clone, depthTruncated, pluginTruncated } = cloneNodeLimited(lookup.node, maxDepth);

            return {
                path: segments.join("."),
                maxDepth,
                version: dataModelState.version ?? null,
                receivedAt: dataModelState.updatedAt,
                generatedAt: snapshot.generatedAt ?? null,
                depthTruncated,
                pluginTruncated: Boolean(snapshot.truncated || pluginTruncated),
                node: clone,
            };
        }
        case "find_item_model": {
            const snapshot = getSnapshotOrThrow();
            const itemName = typeof args.itemName === "string" ? args.itemName : "";
            if (!itemName) {
                throw createMcpError(ErrorCode.InvalidRequest, "itemName parameter is required", 400);
            }

            const maxDepthArg = Number(args.maxDepth);
            let maxDepth = 5;
            if (Number.isFinite(maxDepthArg)) {
                maxDepth = Math.max(0, Math.min(Math.floor(maxDepthArg), 10));
            }

            const workspaceSegments = normalizePathSegments("game.Workspace.ItemModels");
            const replicatedSegments = normalizePathSegments("game.ReplicatedStorage.ItemModels");

            let itemModelsFolder = null;
            let itemModelsFolderPath = "";

            const workspaceLookup = findNodeBySegments(snapshot.root, workspaceSegments);
            if (workspaceLookup.node) {
                itemModelsFolder = workspaceLookup.node;
                itemModelsFolderPath = "game.Workspace.ItemModels";
            } else {
                const replicatedLookup = findNodeBySegments(snapshot.root, replicatedSegments);
                if (replicatedLookup.node) {
                    itemModelsFolder = replicatedLookup.node;
                    itemModelsFolderPath = "game.ReplicatedStorage.ItemModels";
                }
            }

            if (!itemModelsFolder) {
                throw createMcpError(
                    ErrorCode.InvalidRequest,
                    "ItemModels folder not found in Workspace or ReplicatedStorage",
                    404,
                );
            }

            const foundModel = findModelRecursive(itemModelsFolder, itemName);

            if (!foundModel) {
                throw createMcpError(
                    ErrorCode.InvalidRequest,
                    `Item model "${itemName}" not found in ${itemModelsFolderPath}`,
                    404,
                );
            }

            const { clone, depthTruncated, pluginTruncated } = cloneNodeLimited(foundModel, maxDepth);

            return {
                itemName,
                path: foundModel.path ?? `${itemModelsFolderPath}.${itemName}`,
                maxDepth,
                version: dataModelState.version ?? null,
                receivedAt: dataModelState.updatedAt,
                generatedAt: snapshot.generatedAt ?? null,
                depthTruncated,
                pluginTruncated: Boolean(snapshot.truncated || pluginTruncated),
                model: clone,
            };
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
        case "run_tests": {
            await ensureMcpConnectionOrThrow("Launch Roblox Studio with the tooling plugin to run invoker.lua.");

            let invokerCode;
            try {
                invokerCode = await readInvokerScript();
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }

                const message = typeof error?.message === "string" ? error.message : String(error);
                throw createMcpError(ErrorCode.InternalError, `Failed to read invoker.lua: ${message}`);
            }

            const timeoutArg = Number(args.timeoutMs);
            const executionOptions = {};
            if (Number.isFinite(timeoutArg) && timeoutArg > 0) {
                executionOptions.timeoutMs = Math.min(Math.floor(timeoutArg), 120000);
            }

            if (typeof onProgress === "function") {
                executionOptions.onProgress = onProgress;
            }

            try {
                return await requestMcpToolExecution("run_tests", { code: invokerCode }, executionOptions);
            } catch (error) {
                wrapToolExecutionError(error);
            }

            return null;
        }
        case "estimate_item_progression": {
            const itemId = typeof args.itemId === "string" ? args.itemId : "";
            if (!itemId) {
                throw createMcpError(ErrorCode.InvalidRequest, "itemId parameter is required", 400);
            }

            await ensureMcpConnectionOrThrow(
                "Launch Roblox Studio with the tooling plugin to enable progression estimates.",
            );

            const executionOptions = {};
            if (typeof onProgress === "function") {
                executionOptions.onProgress = onProgress;
            }

            try {
                return await requestMcpToolExecution("estimate_item_progression", { itemId }, executionOptions);
            } catch (error) {
                wrapToolExecutionError(error);
            }

            return null;
        }
        default:
            throw createMcpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`, 404);
    }
}
