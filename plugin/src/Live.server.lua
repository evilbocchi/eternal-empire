local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local getBaseUrl = require(script.Parent.getBaseUrl)
local log = require(script.Parent.log)
local StreamClient = require(script.Parent.StreamClient)

local streamClient = nil

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

local function sendUpdate()
    if not streamClient or not streamClient:isConnected() then
        return
    end

    local json = HttpService:JSONEncode({
        waypoints = getWaypointData(),
        save = {
            player = game.Players.LocalPlayer.Name,
            empireData = _G.empireData,
            playerData = _G.playerData,
        },
    })

    -- Send via POST request instead of over the stream
    local endpoint = getBaseUrl() .. "/live/data"

    local success, result = pcall(function()
        return HttpService:PostAsync(endpoint, json, Enum.HttpContentType.ApplicationJson)
    end)

    if not success then
        log(string.format(`Failed to post {endpoint}: {result}`))
    end
end

local streamUrl = getBaseUrl() .. "/live/stream"
streamClient = StreamClient.new({
    url = streamUrl,
    method = "GET",
    headers = {
        ["Accept"] = "text/event-stream",
    },
    reconnectDelay = 5,
    log = log,
    onOpened = function(responseStatusCode)
        log(string.format(`Connected to stream {streamUrl} (status: {responseStatusCode})`))
        -- Send initial update on connection
        task.delay(0.5, sendUpdate)
    end,
    onMessage = function(message)
        -- Server can send refresh commands
        if type(message) == "string" and string.find(message, "refresh") then
            sendUpdate()
        end
    end,
    onClosed = function()
        log("Stream closed, reconnecting...")
    end,
    onError = function(responseStatusCode, errorMessage)
        log(string.format(`Stream {streamUrl} error (status: {responseStatusCode}): {errorMessage}`))
    end,
})

streamClient:connect()

-- Cleanup on plugin unload
plugin.Unloading:Connect(function()
    if streamClient then
        streamClient:dispose()
    end
end)
