local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local ServerScriptService = game:GetService("ServerScriptService")
local Workspace = game:GetService("Workspace")

if RunService:IsRunning() then
    return
end

local STREAM_PATH = "/test/stream"
local STATUS_PATH = "/test/status"
local LOG_PATH = "/test/log"
local RESULT_PATH = "/test/result"

local RECONNECT_DELAY = 5
local streamClient
local streamConnections = {}
local isRunning = false

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
        warn(string.format("[TestRunner] Failed to close stream client: %s", tostring(result)))
    end

    streamClient = nil
end

local function getBaseUrl()
    local port = Workspace:GetAttribute("ToolingPort") or 28354
    return string.format("http://localhost:%d", port)
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
        warn(string.format("[TestRunner] Request to %s failed: %s", path, tostring(result)))
        return false
    end

    if result.Success ~= true then
        warn(string.format("[TestRunner] Request to %s returned status %d", path, result.StatusCode))
        return false
    end

    return true
end

local function sendStatus(runId, phase, message)
    local payload = {
        runId = runId,
        phase = phase,
        message = message,
    }
    postJson(STATUS_PATH, payload)
end

local function sendLog(runId, message, level)
    if type(message) ~= "string" or message == "" then
        return
    end

    local payload = {
        runId = runId,
        message = message,
        level = level or "info",
    }

    postJson(LOG_PATH, payload)
end

local function sendResult(runId, result)
    result.runId = runId
    postJson(RESULT_PATH, result)
end

local function relayPrints(runId, prints)
    if type(prints) ~= "table" then
        return
    end

    for _, entry in ipairs(prints) do
        if type(entry) == "string" and entry ~= "" then
            sendLog(runId, entry, "info")
        end
    end
end

local function executeRun(runId)
    if isRunning then
        sendLog(runId, "A test run is already active; ignoring new request.", "error")
        sendResult(runId, {
            success = false,
            summary = {
                successCount = 0,
                failureCount = 0,
                skippedCount = 0,
                durationMs = 0,
            },
            error = "busy",
        })
        return
    end

    isRunning = true

    sendStatus(runId, "starting", "Studio received test run command.")

    local ReplicatedStorage = game:GetService("ReplicatedStorage")
    local target = ReplicatedStorage:WaitForChild("TS"):WaitForChild("hamster"):WaitForChild("runTests")
    print("Running test script from:", target:GetFullName())
    local success, runTests = pcall(require, target)
    if not success or type(runTests) ~= "function" then
        local errorMessage = string.format("Failed to load test script: %s", tostring(runTests))
        sendLog(runId, errorMessage, "error")
        sendResult(runId, {
            success = false,
            summary = {
                successCount = 0,
                failureCount = 0,
                skippedCount = 0,
                durationMs = 0,
            },
            error = errorMessage,
        })
        sendStatus(runId, "finished")
        isRunning = false
        return
    end

    local runSuccess, runOutcome = pcall(runTests)
    if runSuccess then
        relayPrints(runId, runOutcome.lines)

        sendResult(runId, {
            success = runOutcome.success == true,
            summary = {
                successCount = runOutcome.successCount or 0,
                failureCount = runOutcome.failureCount or 0,
                skippedCount = runOutcome.skippedCount or 0,
                durationMs = runOutcome.durationMs or 0,
            },
            lines = runOutcome.lines,
            errors = runOutcome.errors,
            exception = runOutcome.exception,
        })
    else
        local errorMessage = string.format("Test execution failed: %s", tostring(runOutcome))
        sendLog(runId, errorMessage, "error")
        sendResult(runId, {
            success = false,
            summary = {
                successCount = 0,
                failureCount = 0,
                skippedCount = 0,
                durationMs = 0,
            },
            error = errorMessage,
        })
    end

    sendStatus(runId, "finished")

    isRunning = false
end

local function parseSsePayload(raw)
    if type(raw) ~= "string" or raw == "" then
        return nil
    end

    if string.find(raw, 'heartbeat') then
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

    local success, decoded = pcall(function()
        return HttpService:JSONDecode(trimmed)
    end)

    if success then
        decoded.type = eventType
        return decoded
    else
        warn(string.format("[TestRunner] Failed to decode SSE payload: %s", tostring(decoded)))
    end

    return nil
end

local function handleCommand(payload)
    if type(payload) ~= "table" then
        return
    end

    local commandType = payload.type
    if commandType == "run-tests" then
        local runId = payload.runId
        if type(runId) ~= "string" then
            warn("[TestRunner] Received run-tests command without a runId")
            return
        end

        task.spawn(executeRun, runId)
    end
end

local function connectStream()
    if streamClient then
        return
    end

    local url = getBaseUrl() .. STREAM_PATH
    sendStatus(nil, "connecting", string.format("Connecting to %s", url))

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
        warn(string.format("[TestRunner] Failed to create WebStream client: %s", tostring(clientOrError)))
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
        local message = "Studio stream opened"
        if responseStatusCode ~= nil then
            message = string.format("Studio stream opened (status %s)", tostring(responseStatusCode))
        end
        sendStatus(nil, "connected", message)
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
        sendStatus(nil, "disconnected", "Studio stream closed")
        if streamClient == client then
            closeStreamClient()
            task.delay(RECONNECT_DELAY, connectStream)
        end
    end)

    addConnection(client.Error, function(responseStatusCode, errorMessage)
        local statusText = responseStatusCode and string.format("status %s", tostring(responseStatusCode)) or "unknown status"
        local message = string.format("[TestRunner] Stream error (%s): %s", statusText, tostring(errorMessage))
        warn(message)
        sendStatus(nil, "error", message)
    end)
end

if plugin and plugin.Unloading then
    plugin.Unloading:Connect(function()
        closeStreamClient()
    end)
end

sendStatus(nil, "initializing")
connectStream()
