import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { MCP_TOOL_DEFINITIONS, executeMcpTool } from "./toolHandlers.js";

/**
 * Creates and starts the Model Context Protocol server.
 * @param {object} logger - Logger instance (signale)
 * @returns {Promise<Array>} - Resolves to the list of MCP tool definitions
 */
export async function startMcpServer(logger) {
    const server = new Server(
        { name: "ee-roblox-datamodel", version: "0.1.0" },
        {
            capabilities: {
                tools: {},
            },
        },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: MCP_TOOL_DEFINITIONS,
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: rawArgs } = request.params;

        const args = typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {};

        try {
            const result = await executeMcpTool(name, args, { logger, logPrefix: "[MCP]" });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error) {
            if (error instanceof McpError) {
                throw error;
            }

            const message = typeof error?.message === "string" ? error.message : String(error);
            throw new McpError(ErrorCode.InternalError, message);
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    return MCP_TOOL_DEFINITIONS;
}
