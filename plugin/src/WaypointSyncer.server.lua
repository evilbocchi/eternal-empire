local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local getBaseUrl = require(script.Parent.getBaseUrl)
local log = require(script.Parent.log)
local StreamClient = require(script.Parent.StreamClient)

local INTERVAL = 2 -- seconds
local RECONNECT_DELAY = 5 -- seconds

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

local function sendWaypointUpdate()
    if not streamClient or not streamClient:isConnected() then
        return
    end

    local waypoints = game:GetService("Workspace"):FindFirstChild("Waypoints")
    if not waypoints then
        return
    end

    local waypointChildren = waypoints:GetChildren()
    if #waypointChildren == 0 then
        return
    end

    local trees = {
        {
            name = "Workspace",
            className = "Workspace",
            children = {
                serializeInstanceTree(waypoints),
            },
        },
    }

    local json = HttpService:JSONEncode(trees)
    
    -- Send via POST request instead of over the stream
    local success, result = pcall(function()
        return HttpService:PostAsync(
            getBaseUrl() .. "/waypoint/data",
            json,
            Enum.HttpContentType.ApplicationJson
        )
    end)

    if not success then
        log(string.format("Failed to send waypoint update: %s", tostring(result)))
    end
end

local function connectStream()
    if streamClient or RunService:IsRunning() then
        return
    end

    streamClient = StreamClient.new({
        url = getBaseUrl() .. "/waypoint/stream",
        method = "GET",
        headers = {
            ["Accept"] = "text/event-stream",
        },
        reconnectDelay = RECONNECT_DELAY,
        log = log,
        onOpened = function(responseStatusCode)
            log(string.format("Connected to waypoint stream (status: %s)", tostring(responseStatusCode)))
            -- Send initial update on connection
            task.delay(0.5, sendWaypointUpdate)
        end,
        onMessage = function(message)
            -- Server can send refresh commands
            if type(message) == "string" and string.find(message, "refresh") then
                sendWaypointUpdate()
            end
        end,
        onClosed = function()
            log("Waypoint stream closed, reconnecting...")
        end,
        onError = function(responseStatusCode, errorMessage)
            log(string.format("Stream error (status: %s): %s", tostring(responseStatusCode), tostring(errorMessage)))
        end,
    })

    streamClient:connect()
end

-- Connect to stream on load
connectStream()

-- Cleanup on plugin unload
plugin.Unloading:Connect(function()
    if streamClient then
        streamClient:dispose()
    end
end)
