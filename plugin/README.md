# JME Tooling Plugin

This directory contains the tooling plugin that provides development utilities for the JME Roblox game.

## Components

### Node.js Server (`plugin/index.js`)

The Node.js server runs on port 28354 (configurable via `ToolingPort` workspace attribute) and provides:

- **DataModel Sync**: Captures and syncs Roblox Studio's DataModel tree
- **Test Runner**: Remote test execution via SSE streaming
- **MCP Server**: Model Context Protocol server for AI assistants

### Studio Plugins (`plugin/src/*.server.lua`)

Lua plugins that run in Roblox Studio:

1. **DataModelSyncer.server.lua**: Periodically captures and sends DataModel snapshots to the Node.js server
2. **TestRunner.server.lua**: Connects to the test stream and executes tests on command
3. **MCPClient.server.lua**: Connects to the MCP HTTP stream for tool calls
4. **WaypointSyncer.server.lua**: Syncs waypoint data
5. **ProgressionReportWatcher.server.lua**: Watches for progression report changes

## MCP HTTP Streaming

The MCP (Model Context Protocol) HTTP endpoints allow Roblox Studio to interact with the MCP server using the new `HttpService:CreateWebStreamClient()` API.

### Endpoints

#### `GET /mcp/stream`

Server-Sent Events (SSE) stream that maintains a persistent connection to Studio.

**Features:**
- Auto-reconnects on disconnect
- Heartbeat messages every 15 seconds
- Connection status events

**Example (Lua):**
```lua
local client = HttpService:CreateWebStreamClient(Enum.WebStreamClientType.RawStream, {
    Url = "http://localhost:28354/mcp/stream",
    Method = "GET",
    Headers = {
        ["Accept"] = "text/event-stream",
    },
})

client.Opened:Connect(function(statusCode)
    print("MCP stream opened:", statusCode)
end)

client.Closed:Connect(function()
    print("MCP stream closed")
end)
```

#### `POST /mcp/call-tool`

Execute MCP tool calls from Studio.

**Request Body:**
```json
{
    "name": "list_instances",
    "arguments": {
        "path": "game.Workspace",
        "maxDepth": 3
    }
}
```

**Response:**
```json
{
    "success": true,
    "result": {
        "path": "game.Workspace",
        "maxDepth": 3,
        "node": { ... }
    }
}
```

**Example (Lua):**
```lua
local MCPClient = require(script.Parent.MCPClient)

-- List instances at a path
local result, error = MCPClient.callTool("list_instances", {
    path = "game.Workspace",
    maxDepth = 2
})

if result then
    print("Found node:", result.node.name)
else
    warn("Error:", error)
end

-- Find an item model
local itemResult, itemError = MCPClient.callTool("find_item_model", {
    itemName = "Conveyor",
    maxDepth = 5
})
```

#### `GET /mcp/tools`

List available MCP tools.

**Response:**
```json
{
    "tools": [
        {
            "name": "list_instances",
            "description": "List Roblox Studio DataModel instances...",
            "inputSchema": { ... }
        },
        {
            "name": "find_item_model",
            "description": "Search for an item model by name...",
            "inputSchema": { ... }
        }
    ]
}
```

### Available Tools

#### `list_instances`

Lists DataModel instances at a given path with their descendants.

**Parameters:**
- `path` (string, optional): Dot-separated path (e.g., "game.Workspace.MyFolder"). Defaults to "game".
- `maxDepth` (number, optional): Number of descendant levels to include (0 = node only). Defaults to 3, max 10.

**Returns:**
- `path`: The resolved path
- `node`: The DataModel node with children
- `maxDepth`: Actual depth used
- `depthTruncated`: Whether depth limit was reached
- `pluginTruncated`: Whether plugin's node limit was reached
- `version`: Snapshot version number
- `generatedAt`: Timestamp of snapshot generation

#### `find_item_model`

Searches for an item model by name in the ItemModels folder (Workspace or ReplicatedStorage).

**Parameters:**
- `itemName` (string, required): The name of the item model to search for (e.g., "Conveyor", "BasicDropper")
- `maxDepth` (number, optional): Number of descendant levels to include. Defaults to 5, max 10.

**Returns:**
- `itemName`: The requested item name
- `path`: Full path to the found model
- `model`: The item model node with children
- `maxDepth`: Actual depth used
- `depthTruncated`: Whether depth limit was reached
- `pluginTruncated`: Whether plugin's node limit was reached
- `version`: Snapshot version number
- `generatedAt`: Timestamp of snapshot generation

## Development

### Running the Server

```bash
node plugin/index.js
```

The server will start on port 28354 and:
1. Start the Express HTTP server with all endpoints
2. Start the MCP stdio server for AI assistants

### Testing

```bash
npm run plugin:test
```

Runs unit tests for the datamodel utilities and snapshot assembler.

### Building the Plugin

```bash
npm run plugin
```

Builds the Roblox Studio plugin using Rojo.

## Architecture

### MCP Stdio vs HTTP

The plugin provides two ways to access MCP functionality:

1. **Stdio Transport** (original): Used by AI assistants like Claude Desktop that connect via stdio
2. **HTTP/SSE Transport** (new): Used by Roblox Studio plugins via `CreateWebStreamClient()`

Both transports access the same DataModel snapshot and provide the same tools. The HTTP transport is designed specifically for Studio integration using the new streaming API.

### WebStreamClient API

The `MCPClient.server.lua` plugin uses Roblox's new `HttpService:CreateWebStreamClient()` API, which:

- Creates long-lived connections for Server-Sent Events (SSE)
- Fires signals for open, message, close, and error events
- Supports automatic reconnection
- Replaces the need for polling or repeated `RequestAsync()` calls

This follows the same pattern as `TestRunner.server.lua` and is the recommended approach for Studio plugins that need streaming data.
