local HttpService = game:GetService("HttpService")
local getBaseUrl = require(script.Parent.getBaseUrl)
local log = require(script.Parent.log)
local StreamClient = require(script.Parent.StreamClient)

local streamClient

local function sendSaveUpdate()
    if not streamClient or not streamClient:isConnected() then
        return
    end

    local data = {
        empireData = _G.empireData,
        playerData = _G.playerData,
    }
    local json = HttpService:JSONEncode(data)

    -- Send via POST request instead of over the stream
    local success, result = pcall(function()
        return HttpService:PostAsync(getBaseUrl() .. "/save/data", json, Enum.HttpContentType.ApplicationJson)
    end)

    if not success then
        log(string.format("Failed to send save update: %s", tostring(result)))
    end
end

streamClient = StreamClient.new({
    url = getBaseUrl() .. "/save/stream",
    method = "GET",
    headers = {
        ["Accept"] = "text/event-stream",
    },
    reconnectDelay = 5,
    log = log,
    onOpened = function(responseStatusCode)
        log(string.format("Connected to save stream (status: %s)", tostring(responseStatusCode)))
        -- Send initial update on connection
        task.delay(0.5, sendSaveUpdate)
    end,
    onMessage = function(message)
        -- Server can send refresh commands
        if type(message) == "string" and string.find(message, "refresh") then
            sendSaveUpdate()
        end
    end,
    onClosed = function()
        log("Save stream closed, reconnecting...")
    end,
    onError = function(responseStatusCode, errorMessage)
        log(string.format("Stream error (status: %s): %s", tostring(responseStatusCode), tostring(errorMessage)))
    end,
})

streamClient:connect()

-- Cleanup on plugin unload
plugin.Unloading:Connect(function()
    if streamClient then
        streamClient:dispose()
    end
end)
