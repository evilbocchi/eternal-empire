local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

if RunService:IsRunning() then
    return
end

local STREAM_PATH = "/mcp/stream"
local CALL_TOOL_PATH = "/mcp/call-tool"
local TOOLS_PATH = "/mcp/tools"

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

        if type(payloadData) == "string" then
            -- Parse SSE events if needed
            if not string.find(payloadData, "heartbeat", 1, true) then
                print(string.format("[MCPClient] Received: %s", payloadData))
            end
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
