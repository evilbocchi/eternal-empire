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
        - execute_luau: Run arbitrary Luau source within the plugin context and capture its output
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
_G.mcpLogs = _G.mcpLogs or {}

local function log(...)
    table.insert(_G.mcpLogs, ...)
end

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
        log(string.format("[MCPClient] Failed to close stream client: %s", tostring(result)))
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
        log(string.format("[MCPClient] Request to %s failed: %s", CALL_TOOL_PATH, tostring(result)))
        return nil, tostring(result)
    end

    if result.Success ~= true then
        log(string.format("[MCPClient] Request to %s returned status %d", CALL_TOOL_PATH, result.StatusCode))
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
        log(string.format("[MCPClient] Failed to decode response: %s", tostring(decoded)))
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
        log(string.format("[MCPClient] Failed to list tools: %s", tostring(result)))
        return nil
    end

    if result.Success ~= true then
        log(string.format("[MCPClient] List tools returned status %d", result.StatusCode))
        return nil
    end

    local decodeSuccess, decoded = pcall(function()
        return HttpService:JSONDecode(result.Body)
    end)

    if not decodeSuccess then
        log(string.format("[MCPClient] Failed to decode tools: %s", tostring(decoded)))
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
        log(string.format("[MCPClient] Failed to decode SSE payload: %s", tostring(decoded)))
    end

    return nil
end

local function packValues(...)
    return { n = select("#", ...), ... }
end

local function runLuauCode(code, chunkName)
    if type(code) ~= "string" or code == "" then
        return false, "code parameter is required"
    end

    local loader = loadstring
    local usingLoadstring = true
    if type(loader) ~= "function" then
        loader = rawget(_G, "load")
        usingLoadstring = false
    end

    if type(loader) ~= "function" then
        return false, "loadstring is not available in this environment"
    end

    local chunkLabel = chunkName or "MCP.ExecuteLuau"

    local chunk, compileError
    if usingLoadstring then
        chunk, compileError = loader(code, chunkLabel)
    else
        local ok, result = pcall(function()
            return loader(code, chunkLabel, "t")
        end)
        if ok then
            chunk = result
        else
            compileError = result
        end
    end

    if not chunk then
        return false, tostring(compileError or "Failed to compile code")
    end

    local startClock = os.clock()

    local function errorHandler(message)
        local text = tostring(message)
        if debug and type(debug.traceback) == "function" then
            return debug.traceback(text, 2)
        end
        return text
    end

    local LogService = game:GetService("LogService")
    LogService:ClearOutput()

    local ok, packedOrError = xpcall(function()
        return packValues(chunk())
    end, errorHandler)

    task.wait(0.25) -- Allow LogService to flush logs before inspection
    local stdout = {}
    for _, log in pairs(LogService:GetLogHistory()) do
        local t = log.messageType or Enum.MessageType.MessageOutput

        local prefix
        if t == Enum.MessageType.MessageOutput then
            prefix = ""
        elseif t == Enum.MessageType.MessageWarning then
            prefix = "[WARN] "
        elseif t == Enum.MessageType.MessageError then
            prefix = "[ERROR] "
        end

        table.insert(stdout, `{prefix}{log.message}`)
    end

    if not ok then
        return false, tostring(packedOrError)
    end

    local packedResults = packedOrError
    local returnValues = {}
    for index = 1, packedResults.n do
        local value = packedResults[index]
        local valueType = typeof(value)
        local entry = {
            index = index,
            type = valueType,
            string = value == nil and "nil" or tostring(value),
        }

        if valueType == "boolean" or valueType == "number" or valueType == "string" then
            entry.literal = value
        elseif valueType == "table" then
            local encodeOk, encoded = pcall(HttpService.JSONEncode, HttpService, value)
            if encodeOk then
                entry.json = encoded
            end
        end

        returnValues[index] = entry
    end

    local rawDuration = os.clock() - startClock
    local adjustedDuration = rawDuration - 0.25
    if adjustedDuration < 0 then
        adjustedDuration = 0
    end

    return true, {
        durationSeconds = adjustedDuration,
        stdout = stdout,
        returnCount = packedResults.n,
        returnValues = returnValues,
    }
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

local function handleExecuteLuauTool(arguments)
    if type(arguments) ~= "table" then
        return false, "Arguments table is required"
    end

    return runLuauCode(arguments.code, "MCP.ExecuteLuau")
end

local function handleRunTestsTool(arguments)
    local code
    if type(arguments) == "table" then
        local value = arguments.code
        if type(value) == "string" then
            code = value
        end
    end

    if not code or code == "" then
        return false, "code parameter is required"
    end

    local success, payloadOrError = runLuauCode(code, "MCP.RunTests")
    if not success then
        return false, payloadOrError
    end

    local payload = payloadOrError
    local suiteSuccess
    local rawResultJson
    local decodedResult

    local returnValues = payload.returnValues
    if type(returnValues) == "table" then
        for _, entry in ipairs(returnValues) do
            if type(entry) ~= "table" then
                continue
            end

            if entry.index == 1 and entry.type == "boolean" then
                suiteSuccess = entry.literal
            elseif entry.index == 2 then
                local jsonCandidate

                if type(entry.json) == "string" and entry.json ~= "" then
                    jsonCandidate = entry.json
                elseif entry.type == "string" and type(entry.literal) == "string" then
                    jsonCandidate = entry.literal
                end

                if jsonCandidate then
                    rawResultJson = jsonCandidate
                    local decodeOk, decoded = pcall(HttpService.JSONDecode, HttpService, jsonCandidate)
                    if decodeOk and type(decoded) == "table" then
                        decodedResult = decoded
                    end
                end
            end
        end
    end

    local results = decodedResult and decodedResult.results
    local summary
    local failedSuites = {}
    local failedTests = {}

    if type(results) == "table" then
        local function numberOrDefault(value)
            return typeof(value) == "number" and value or 0
        end

        summary = {
            totalSuites = numberOrDefault(results.numTotalTestSuites),
            passedSuites = numberOrDefault(results.numPassedTestSuites),
            failedSuites = numberOrDefault(results.numFailedTestSuites),
            pendingSuites = numberOrDefault(results.numPendingTestSuites),
            totalTests = numberOrDefault(results.numTotalTests),
            successCount = numberOrDefault(results.numPassedTests),
            failureCount = numberOrDefault(results.numFailedTests),
            skippedCount = numberOrDefault(results.numPendingTests),
            todoCount = numberOrDefault(results.numTodoTests),
        }

        local totalRuntimeMs = 0
        local testResults = results.testResults
        if type(testResults) == "table" then
            for _, suite in ipairs(testResults) do
                if type(suite) ~= "table" then
                    continue
                end

                local messages = {}
                if type(suite.failureMessage) == "string" and suite.failureMessage ~= "" then
                    table.insert(messages, suite.failureMessage)
                end

                if type(suite.failureMessages) == "table" then
                    for _, message in ipairs(suite.failureMessages) do
                        if type(message) == "string" and message ~= "" then
                            table.insert(messages, message)
                        end
                    end
                end

                local perfStats = suite.perfStats
                if type(perfStats) == "table" then
                    local runtimeMs = perfStats.runtime
                    if typeof(runtimeMs) == "number" then
                        totalRuntimeMs += runtimeMs
                    end
                end

                if #messages > 0 then
                    table.insert(failedSuites, {
                        path = suite.testFilePath or suite.name or suite.displayName,
                        messages = messages,
                    })
                end

                local assertionResults = suite.assertionResults
                if type(assertionResults) == "table" then
                    for _, assertion in ipairs(assertionResults) do
                        if type(assertion) ~= "table" then
                            continue
                        end

                        local status = assertion.status
                        if status ~= "passed" then
                            table.insert(failedTests, {
                                path = suite.testFilePath or suite.name or suite.displayName,
                                title = assertion.title,
                                fullName = assertion.fullName,
                                status = status,
                                ancestorTitles = assertion.ancestorTitles,
                                failureMessages = assertion.failureMessages,
                            })
                        end
                    end
                end
            end
        end

        if totalRuntimeMs > 0 then
            summary.runtimeSeconds = totalRuntimeMs / 1000
        elseif typeof(results.runtime) == "number" then
            summary.runtimeSeconds = results.runtime
        end

        if typeof(results.startTime) == "number" then
            summary.startTimeEpochMs = results.startTime
        end
    end

    local overallSuccess = suiteSuccess
    if overallSuccess == nil then
        if type(summary) == "table" and summary.failureCount ~= nil then
            overallSuccess = summary.failureCount == 0
        elseif type(results) == "table" and typeof(results.success) == "boolean" then
            overallSuccess = results.success
        end
    end

    if #failedSuites == 0 then
        failedSuites = nil
    end

    if #failedTests == 0 then
        failedTests = nil
    end

    local enriched = {
        durationSeconds = payload.durationSeconds,
        stdout = payload.stdout,
        success = overallSuccess == nil and true or overallSuccess == true,
        summary = summary,
        failedSuites = failedSuites,
        failedTests = failedTests,
        rawResultJson = rawResultJson,
    }

    return true, enriched
end

local function handleToolCommand(payload)
    if type(payload) ~= "table" then
        return
    end

    local requestId = payload.requestId
    if type(requestId) ~= "string" then
        log("[MCPClient] Received call-tool command without requestId")
        return
    end

    local toolName = payload.name
    local arguments = payload.arguments

    local success, resultOrError
    if toolName == "estimate_item_progression" then
        success, resultOrError = handleEstimateItemTool(arguments)
    elseif toolName == "execute_luau" then
        success, resultOrError = handleExecuteLuauTool(arguments)
    elseif toolName == "run_tests" then
        success, resultOrError = handleRunTestsTool(arguments)
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
        log(string.format("[MCPClient] Failed to send tool response: %s", tostring(errorMessage)))
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
    log(string.format("[MCPClient] Connecting to %s", url))

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
        log(string.format("[MCPClient] Failed to create WebStream client: %s", tostring(clientOrError)))
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
        log(string.format("[MCPClient] %s", message))
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
        if streamClient == client then
            closeStreamClient()
            task.delay(RECONNECT_DELAY, connectStream)
        end
    end)

    addConnection(client.Error, function(responseStatusCode, errorMessage)
        local statusText = responseStatusCode and string.format("status %s", tostring(responseStatusCode)) or "unknown status"
        local message = string.format("[MCPClient] Stream error (%s): %s", statusText, tostring(errorMessage))
        log(message)
    end)
end

-- Public API
local MCPClient = {
    callTool = callTool,
    listTools = listTools,
}

-- Connect to stream on load
connectStream()

if plugin and plugin.Unloading then
    plugin.Unloading:Connect(function()
        closeStreamClient()
    end)
end

return MCPClient
