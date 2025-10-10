import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { dataModelState, connectionState } from "../state/dataModelState.js";
import { normalizePathSegments, findNodeBySegments, cloneNodeLimited } from "../datamodel/datamodelUtils.js";
import {
    isStreamConnected as isMcpStreamConnected,
    requestToolExecution as requestMcpToolExecution,
} from "./toolBridge.js";

/**
 * Creates and starts the Model Context Protocol server.
 * @param {object} logger - Logger instance (signale)
 * @returns {Promise<void>}
 */
export async function startMcpServer(logger) {
    const server = new Server(
        { name: "jme-roblox-datamodel", version: "0.1.0" },
        {
            capabilities: {
                tools: {},
            },
        },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            {
                name: "list_instances",
                description: "List Roblox Studio DataModel instances captured by the companion plugin.",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description:
                                "Dot path to the starting instance (e.g. game.Workspace.MyFolder). " +
                                "Defaults to the DataModel root.",
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
        ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: rawArgs } = request.params;

        const args = typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {};

        if (name === "list_instances") {
            const snapshot = dataModelState.snapshot;
            if (!snapshot) {
                const message = connectionState.pluginConnected
                    ? "Awaiting first DataModel snapshot from the Roblox Studio plugin."
                    : "Plugin connection not detected. Launch Roblox Studio with the tooling plugin to populate the DataModel snapshot.";
                throw new McpError(ErrorCode.FailedPrecondition, message);
            }

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

                logger.warn(`[MCP] Lookup failed: ${message}`);
                throw new McpError(ErrorCode.InvalidRequest, message);
            }

            const { clone, depthTruncated, pluginTruncated } = cloneNodeLimited(lookup.node, maxDepth);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                path: segments.join("."),
                                maxDepth,
                                version: dataModelState.version ?? null,
                                receivedAt: dataModelState.updatedAt,
                                generatedAt: snapshot.generatedAt ?? null,
                                depthTruncated,
                                pluginTruncated: Boolean(snapshot.truncated || pluginTruncated),
                                node: clone,
                            },
                            null,
                            2,
                        ),
                    },
                ],
            };
        } else if (name === "find_item_model") {
            const snapshot = dataModelState.snapshot;
            if (!snapshot) {
                const message = connectionState.pluginConnected
                    ? "Awaiting first DataModel snapshot from the Roblox Studio plugin."
                    : "Plugin connection not detected. Launch Roblox Studio with the tooling plugin to populate the DataModel snapshot.";
                throw new McpError(ErrorCode.FailedPrecondition, message);
            }

            const itemName = typeof args.itemName === "string" ? args.itemName : "";
            if (!itemName) {
                throw new McpError(ErrorCode.InvalidRequest, "itemName parameter is required");
            }

            const maxDepthArg = Number(args.maxDepth);
            let maxDepth = 5;
            if (Number.isFinite(maxDepthArg)) {
                maxDepth = Math.max(0, Math.min(Math.floor(maxDepthArg), 10));
            }

            // Try to find ItemModels folder in Workspace or ReplicatedStorage
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
                throw new McpError(
                    ErrorCode.InvalidRequest,
                    "ItemModels folder not found in Workspace or ReplicatedStorage",
                );
            }

            // Search for the item model by name
            function findModelRecursive(node, targetName) {
                if (!node) return null;

                // Check if current node is the model we're looking for
                if (node.name === targetName && (node.className === "Model" || node.className === "Folder")) {
                    return node;
                }

                // Search children
                if (Array.isArray(node.children)) {
                    for (const child of node.children) {
                        const result = findModelRecursive(child, targetName);
                        if (result) return result;
                    }
                }

                return null;
            }

            const foundModel = findModelRecursive(itemModelsFolder, itemName);

            if (!foundModel) {
                throw new McpError(
                    ErrorCode.InvalidRequest,
                    `Item model "${itemName}" not found in ${itemModelsFolderPath}`,
                );
            }

            const { clone, depthTruncated, pluginTruncated } = cloneNodeLimited(foundModel, maxDepth);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                itemName,
                                path: foundModel.path ?? `${itemModelsFolderPath}.${itemName}`,
                                maxDepth,
                                version: dataModelState.version ?? null,
                                receivedAt: dataModelState.updatedAt,
                                generatedAt: snapshot.generatedAt ?? null,
                                depthTruncated,
                                pluginTruncated: Boolean(snapshot.truncated || pluginTruncated),
                                model: clone,
                            },
                            null,
                            2,
                        ),
                    },
                ],
            };
        } else if (name === "estimate_item_progression") {
            const itemId = typeof args.itemId === "string" ? args.itemId : "";
            if (!itemId) {
                throw new McpError(ErrorCode.InvalidRequest, "itemId parameter is required");
            }

            if (!isMcpStreamConnected()) {
                throw new McpError(
                    ErrorCode.FailedPrecondition,
                    "Studio MCP client is not connected. Launch Roblox Studio with the tooling plugin to enable progression estimates.",
                );
            }

            try {
                const result = await requestMcpToolExecution("estimate_item_progression", { itemId });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                const message = typeof error?.message === "string" ? error.message : String(error);
                let code = ErrorCode.InternalError;
                if (/not connected/i.test(message)) {
                    code = ErrorCode.FailedPrecondition;
                } else if (/timed out/i.test(message)) {
                    code = ErrorCode.DeadlineExceeded;
                }
                throw new McpError(code, message);
            }
        } else {
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("MCP server ready (list_instances, find_item_model).");
}
