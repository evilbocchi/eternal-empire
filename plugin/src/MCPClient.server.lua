--[[
    MCP Client for Roblox Studio

    Available Tools:
    - list_instances: List DataModel instances at a given path
    - find_item_model: Search for an item model by name in ItemModels folder
    - execute_luau: Run arbitrary Luau source within the plugin context and capture its output
]]
local HttpService = game:GetService("HttpService")
local log = require(script.Parent.log)
local StreamClient = require(script.Parent.StreamClient)

local BASE_URL = "http://localhost:28355"
local STREAM_PATH = "/mcp/stream"
local CALL_TOOL_PATH = "/mcp/call-tool"
local TOOLS_PATH = "/mcp/tools"
local TOOL_RESPONSE_PATH = "/mcp/tool-response"
local TOOL_PROGRESS_PATH = "/mcp/tool-progress"

local RECONNECT_DELAY = 5
local streamClient

local function callTool(toolName, arguments)
    local url = BASE_URL .. CALL_TOOL_PATH
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
        log(string.format("Request to %s failed: %s", CALL_TOOL_PATH, tostring(result)))
        return nil, tostring(result)
    end

    if result.Success ~= true then
        log(string.format("Request to %s returned status %d", CALL_TOOL_PATH, result.StatusCode))
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
        log(string.format("Failed to decode response: %s", tostring(decoded)))
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
    local url = BASE_URL .. path
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
    local url = BASE_URL .. TOOLS_PATH

    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "GET",
        })
    end)

    if not success then
        log(string.format("Failed to list tools: %s", tostring(result)))
        return nil
    end

    if result.Success ~= true then
        log(string.format("List tools returned status %d", result.StatusCode))
        return nil
    end

    local decodeSuccess, decoded = pcall(function()
        return HttpService:JSONDecode(result.Body)
    end)

    if not decodeSuccess then
        log(string.format("Failed to decode tools: %s", tostring(decoded)))
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
        log(string.format("Failed to decode SSE payload: %s", tostring(decoded)))
    end

    return nil
end

local function packValues(...)
    return { n = select("#", ...), ... }
end

local function runLuauCode(code, chunkName, options)
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
    local requestId
    if type(options) == "table" then
        local value = options.requestId
        if type(value) == "string" and value ~= "" then
            requestId = value
        end
    end

    local function errorHandler(message)
        local text = tostring(message)
        if debug and type(debug.traceback) == "function" then
            return debug.traceback(text, 2)
        end
        return text
    end

    local LogService = game:GetService("LogService")
    LogService:ClearOutput()

    local stdout = {}

    local function streamLog(level, line)
        if not requestId or type(line) ~= "string" or line == "" then
            return
        end

        task.spawn(function()
            local ok, errorMessage = postJson(TOOL_PROGRESS_PATH, {
                requestId = requestId,
                message = line,
                level = level,
                timestamp = os.clock(),
            })

            if not ok and errorMessage then
                log(string.format("Failed to send tool progress: %s", tostring(errorMessage)))
            end
        end)
    end

    local function appendLog(message, messageType)
        if message == nil then
            return
        end

        local text = tostring(message)
        local level = "info"
        local prefix = ""

        if messageType == Enum.MessageType.MessageWarning then
            level = "warn"
            prefix = "[WARN] "
        elseif messageType == Enum.MessageType.MessageError then
            level = "error"
            prefix = "[ERROR] "
        end

        local line = prefix .. text
        table.insert(stdout, line)
        streamLog(level, line)
    end

    local logConnection
    local success, connectionError = pcall(function()
        logConnection = LogService.MessageOut:Connect(function(message, messageType)
            appendLog(message, messageType)
        end)
    end)

    if not success then
        log(string.format("Failed to connect MessageOut listener: %s", tostring(connectionError)))
    end

    local ok, packedOrError = xpcall(function()
        return packValues(chunk())
    end, errorHandler)

    task.wait(0.25) -- Allow LogService to flush logs before inspection

    if logConnection then
        logConnection:Disconnect()
    end

    local history = LogService:GetLogHistory()
    if type(history) == "table" then
        local capturedCount = #stdout
        local totalCount = #history

        if totalCount > capturedCount then
            for index = capturedCount + 1, totalCount do
                local entry = history[index]
                if type(entry) == "table" then
                    appendLog(entry.message, entry.messageType)
                end
            end
        end
    end

    if not ok then
        local errorText = tostring(packedOrError)
        appendLog(errorText, Enum.MessageType.MessageError)
        return false, errorText
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

    return true,
        {
            durationSeconds = adjustedDuration,
            stdout = stdout,
            returnCount = packedResults.n,
            returnValues = returnValues,
        }
end

local function handleExecuteLuauTool(arguments, requestId)
    if type(arguments) ~= "table" then
        return false, "Arguments table is required"
    end

    return runLuauCode(arguments.code, "MCP.ExecuteLuau", {
        requestId = requestId,
    })
end

local function handleRunTestsTool(arguments, requestId)
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

    local success, payloadOrError = runLuauCode(code, "MCP.RunTests", {
        requestId = requestId,
    })
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

    local enriched = {
        durationSeconds = payload.durationSeconds,
        stdout = payload.stdout,
        success = overallSuccess == nil and true or overallSuccess == true,
        summary = summary,
        failedSuites = #failedSuites > 0 and failedSuites or nil,
        failedTests = #failedTests > 0 and failedTests or nil,
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
        log("Received call-tool command without requestId")
        return
    end

    local toolName = payload.name
    local arguments = payload.arguments

    local success, resultOrError
    if toolName == "execute_luau" then
        success, resultOrError = handleExecuteLuauTool(arguments, requestId)
    elseif toolName == "run_tests" then
        success, resultOrError = handleRunTestsTool(arguments, requestId)
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
        log(string.format("Failed to send tool response: %s", tostring(errorMessage)))
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

    streamClient = StreamClient.new({
        url = BASE_URL .. STREAM_PATH,
        method = "GET",
        headers = {
            ["Accept"] = "text/event-stream",
        },
        reconnectDelay = RECONNECT_DELAY,
        log = log,
        onOpened = function(responseStatusCode)
            local message = "MCP stream opened"
            if responseStatusCode ~= nil then
                message = string.format("MCP stream opened (status %s)", tostring(responseStatusCode))
            end
            log(message)
        end,
        onMessage = function(message)
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
        end,
        onClosed = function()
            log("MCP stream closed, reconnecting...")
        end,
        onError = function(responseStatusCode, errorMessage)
            local statusText = responseStatusCode and string.format("status %s", tostring(responseStatusCode))
                or "unknown status"
            log(string.format("Stream error (%s): %s", statusText, tostring(errorMessage)))
        end,
    })

    streamClient:connect()
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
        if streamClient then
            streamClient:dispose()
        end
    end)
end

return MCPClient
