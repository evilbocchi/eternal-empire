local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local log = require(script.Parent.log)
local StreamClient = require(script.Parent.StreamClient)

local BASE_URL = "http://localhost:28354"
local streamClient = nil
local lastSentWaypoints = nil

local function serializeInstanceTree(instance)
    local node = {
        name = instance.Name,
        className = instance.ClassName,
        children = {},
    }

    for _, child in ipairs(instance:GetChildren()) do
        local childNode = serializeInstanceTree(child)
        if childNode then
            table.insert(node.children, childNode)
        end
    end
    return node
end

local function getWaypointData()
    local waypoints = game:GetService("Workspace"):FindFirstChild("Waypoints")
    if not waypoints then
        return nil
    end

    local waypointChildren = waypoints:GetChildren()
    if #waypointChildren == 0 then
        return
    end

    return RunService:IsRunning() and nil
        or {
            {
                name = "Workspace",
                className = "Workspace",
                children = {
                    serializeInstanceTree(waypoints),
                },
            },
        }
end

local DATA_URL = BASE_URL .. "/live/data"

local function sendUpdate()
    if not streamClient or not streamClient:isConnected() then
        return
    end

    local currentWaypoints = getWaypointData()

    -- Compare with last sent waypoints
    local currentJson = HttpService:JSONEncode(currentWaypoints)
    local lastJson = HttpService:JSONEncode(lastSentWaypoints)

    if currentJson == lastJson then
        return -- No change, skip sending
    end

    local json = HttpService:JSONEncode({
        waypoints = currentWaypoints,
    })

    local success, result = pcall(function()
        return HttpService:PostAsync(DATA_URL, json, Enum.HttpContentType.ApplicationJson)
    end)

    if not success then
        log(`Failed to post {DATA_URL}: {result}`)
    else
        -- Update last sent waypoints only on successful post
        lastSentWaypoints = currentWaypoints
    end
end

local STREAM_URL = BASE_URL .. "/live/stream"
streamClient = StreamClient.new({
    url = STREAM_URL,
    method = "GET",
    headers = {
        ["Accept"] = "text/event-stream",
    },
    reconnectDelay = 5,
    log = log,
    onOpened = function(responseStatusCode)
        log(string.format(`Connected to stream {STREAM_URL} (status: {responseStatusCode})`))
        -- Send initial update on connection
        task.delay(0.5, sendUpdate)
    end,
    onMessage = function(message)
        -- Server can send refresh commands
        if type(message) == "string" and string.find(message, "refresh") then
            local remote = workspace:FindFirstChild("LiveRemote")
            if remote and remote:IsA("RemoteEvent") then
                remote:FireAllClients(DATA_URL)
            end
            sendUpdate()
        end
    end,
    onClosed = function()
        log("Stream closed, reconnecting...")
    end,
    onError = function(responseStatusCode, errorMessage)
        log(string.format(`Stream {STREAM_URL} error (status: {responseStatusCode}): {errorMessage}`))
    end,
})

streamClient:connect()

-- Cleanup on plugin unload
plugin.Unloading:Connect(function()
    if streamClient then
        streamClient:dispose()
    end
end)
