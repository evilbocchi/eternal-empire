--[[
    MCPClient - Roblox Studio Plugin for MCP HTTP Streaming
    
    This plugin connects to the MCP HTTP server using the new HttpService:CreateWebStreamClient() API.
    It provides access to Model Context Protocol tools for querying the DataModel.
    
    Usage:
        local MCPClient = require(script.Parent.MCPClient)
        
        -- Call a tool
        local result, error = MCPClient.callTool("list_instances", {
            path = "game.Workspace",
            maxDepth = 2
        })
        
        -- List available tools
        local tools = MCPClient.listTools()
    
    Available Tools:
        - list_instances: List DataModel instances at a given path
        - find_item_model: Search for an item model by name in ItemModels folder
        - estimate_item_progression: Calculate time-to-obtain details for a specific item
]]

local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

if RunService:IsRunning() then
    return
end

local STREAM_PATH = "/mcp/stream"
local CALL_TOOL_PATH = "/mcp/call-tool"
local TOOLS_PATH = "/mcp/tools"
local TOOL_RESPONSE_PATH = "/mcp/tool-response"

local RECONNECT_DELAY = 5
local streamClient
local streamConnections = {}

local function disconnectClientConnections()
    for _, connection in ipairs(streamConnections) do
        if connection and connection.Disconnect then
            connection:Disconnect()
        end
    end
    table.clear(streamConnections)
end

local function closeStreamClient()
    if not streamClient then
        return
    end

    disconnectClientConnections()

    local success, result = pcall(function()
        if typeof(streamClient.Close) == "function" then
            streamClient:Close()
        elseif typeof(streamClient.close) == "function" then
            streamClient:close()
        end
    end)

    if not success then
        warn(string.format("[MCPClient] Failed to close stream client: %s", tostring(result)))
    end

    streamClient = nil
end

local function getBaseUrl()
    local port = Workspace:GetAttribute("ToolingPort") or 28354
    return string.format("http://localhost:%d", port)
end

local function callTool(toolName, arguments)
    local url = getBaseUrl() .. CALL_TOOL_PATH
    local payload = {
        name = toolName,
        arguments = arguments or {},
    }
    local encoded = HttpService:JSONEncode(payload)
    
    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json",
            },
            Body = encoded,
        })
    end)

    if not success then
        warn(string.format("[MCPClient] Request to %s failed: %s", CALL_TOOL_PATH, tostring(result)))
        return nil, tostring(result)
    end

    if result.Success ~= true then
        warn(string.format("[MCPClient] Request to %s returned status %d", CALL_TOOL_PATH, result.StatusCode))
        if result.Body then
            local decodeSuccess, decoded = pcall(function()
                return HttpService:JSONDecode(result.Body)
            end)
            if decodeSuccess and decoded.error then
                return nil, decoded.error
            end
        end
        return nil, string.format("HTTP %d", result.StatusCode)
    end

    local decodeSuccess, decoded = pcall(function()
        return HttpService:JSONDecode(result.Body)
    end)

    if not decodeSuccess then
        warn(string.format("[MCPClient] Failed to decode response: %s", tostring(decoded)))
        return nil, "Failed to decode response"
    end

    if decoded.success and decoded.result then
        return decoded.result, nil
    elseif decoded.error then
        return nil, decoded.error
    end

    return nil, "Unknown response format"
end

local function postJson(path, payload)
    local url = getBaseUrl() .. path
    local encoded = HttpService:JSONEncode(payload)

    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json",
            },
            Body = encoded,
        })
    end)

    if not success then
        return false, tostring(result)
    end

    if result.Success ~= true then
        return false, string.format("HTTP %d", result.StatusCode)
    end

    return true, result
end

local function listTools()
    local url = getBaseUrl() .. TOOLS_PATH
    
    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "GET",
        })
    end)

    if not success then
        warn(string.format("[MCPClient] Failed to list tools: %s", tostring(result)))
        return nil
    end

    if result.Success ~= true then
        warn(string.format("[MCPClient] List tools returned status %d", result.StatusCode))
        return nil
    end

    local decodeSuccess, decoded = pcall(function()
        return HttpService:JSONDecode(result.Body)
    end)

    if not decodeSuccess then
        warn(string.format("[MCPClient] Failed to decode tools: %s", tostring(decoded)))
        return nil
    end

    return decoded.tools
end

local function parseSsePayload(raw)
    if type(raw) ~= "string" or raw == "" then
        return nil
    end

    if string.find(raw, "heartbeat") then
        return nil
    end

    local eventType = string.match(raw, "event:%s*(%S+)")

    local dataLines = {}
") do
    for line in string.gmatch(raw, "[^\n]+") do
        if string.sub(line, 1, 5) == "data:" then
            table.insert(dataLines, string.sub(line, 6))
        end
    end

    if #dataLines == 0 then
        table.insert(dataLines, raw)
    end

    local body = table.concat(dataLines, "\n")
    local trimmed = string.gsub(body, "^%s*(.-)%s*$", "%1")
    if trimmed == "" then
        return nil
    end

    local decodeSuccess, decoded = pcall(function()
        return HttpService:JSONDecode(trimmed)
    end)

    if decodeSuccess and type(decoded) == "table" then
        decoded.type = eventType or decoded.type
        return decoded
    elseif not decodeSuccess then
        warn(string.format("[MCPClient] Failed to decode SSE payload: %s", tostring(decoded)))
    end

    return nil
end

local function handleEstimateItemTool(arguments)
    local itemId
    if type(arguments) == "table" then
        local value = arguments.itemId
        if type(value) == "string" and value ~= "" then
            itemId = value
        end
    end

    if not itemId then
        return false, "itemId parameter is required"
    end

    local estimator = rawget(_G, "ProgressionEstimateItem")
    if type(estimator) ~= "function" then
        return false, "ProgressionEstimateItem global is not available"
    end

    local ok, result = pcall(estimator, itemId)
    if not ok then
        return false, tostring(result)
    end

    if result == nil then
        return false, "Item not found or estimate unavailable"
    end

    return true, result
end

local function handleToolCommand(payload)
    if type(payload) ~= "table" then
        return
    end

    local requestId = payload.requestId
    if type(requestId) ~= "string" then
        warn("[MCPClient] Received call-tool command without requestId")
        return
    end

    local toolName = payload.name
    local arguments = payload.arguments

    local success, resultOrError
    if toolName == "estimate_item_progression" then
        success, resultOrError = handleEstimateItemTool(arguments)
    else
        success = false
        resultOrError = string.format("Unknown tool: %s", tostring(toolName))
    end

    local responsePayload = {
        requestId = requestId,
        success = success,
    }

    if success then
        responsePayload.result = resultOrError
    else
        responsePayload.error = resultOrError
    end

    local ok, errorMessage = postJson(TOOL_RESPONSE_PATH, responsePayload)
    if not ok then
        warn(string.format("[MCPClient] Failed to send tool response: %s", tostring(errorMessage)))
    end
end

local function handleCommand(payload)
    if type(payload) ~= "table" then
        return
    end

    local commandType = payload.type
    if commandType == "call-tool" then
        handleToolCommand(payload)
    end
end

local function connectStream()
    if streamClient then
        return
    end

    local url = getBaseUrl() .. STREAM_PATH
    print(string.format("[MCPClient] Connecting to %s", url))

    local success, clientOrError = pcall(function()
        return HttpService:CreateWebStreamClient(Enum.WebStreamClientType.RawStream, {
            Url = url,
            Method = "GET",
            Headers = {
                ["Accept"] = "text/event-stream",
            },
        })
    end)

    if not success then
        warn(string.format("[MCPClient] Failed to create WebStream client: %s", tostring(clientOrError)))
        task.delay(RECONNECT_DELAY, connectStream)
        return
    end

    local client = clientOrError
    disconnectClientConnections()
    streamClient = client

    local function addConnection(signal, handler)
        if not signal then
            return
        end

        local connection = signal:Connect(handler)
        table.insert(streamConnections, connection)
    end

    addConnection(client.Opened, function(responseStatusCode)
        local message = "MCP stream opened"
        if responseStatusCode ~= nil then
            message = string.format("MCP stream opened (status %s)", tostring(responseStatusCode))
        end
        print(string.format("[MCPClient] %s", message))
    end)

    addConnection(client.MessageReceived, function(message)
        local payloadData = message
        if type(message) == "table" then
            payloadData = message.Data or message.data or message.Body or message.body
        end

        if type(payloadData) ~= "string" then
            return
        end

        local payload = parseSsePayload(payloadData)
        if payload ~= nil then
            handleCommand(payload)
        end
    end)

    addConnection(client.Closed, function()
        print("[MCPClient] MCP stream closed")
        if streamClient == client then
            closeStreamClient()
            task.delay(RECONNECT_DELAY, connectStream)
        end
    end)

    addConnection(client.Error, function(responseStatusCode, errorMessage)
        local statusText = responseStatusCode and string.format("status %s", tostring(responseStatusCode)) or "unknown status"
        local message = string.format("[MCPClient] Stream error (%s): %s", statusText, tostring(errorMessage))
        warn(message)
    end)
end

-- Public API
local MCPClient = {
    callTool = callTool,
    listTools = listTools,
}

-- Connect to stream on load
connectStream()

-- List available tools on startup
task.spawn(function()
    task.wait(1) -- Wait a bit for connection to establish
    local tools = listTools()
    if tools then
        print("[MCPClient] Available MCP tools:")
        for _, tool in ipairs(tools) do
            print(string.format("  - %s: %s", tool.name, tool.description or ""))
        end
    end
end)

if plugin and plugin.Unloading then
    plugin.Unloading:Connect(function()
        closeStreamClient()
    end)
end

return MCPClient
