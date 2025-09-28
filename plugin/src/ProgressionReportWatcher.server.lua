local HttpService = game:GetService("HttpService")

local function getEndpoint()
    local currentPort = workspace:GetAttribute("WaypointSyncPort") or 28354
    return `http://localhost:{currentPort}/progression-report`
end

local lastSentPerValue = setmetatable({}, { __mode = "k" })
local MAX_CHUNK_SIZE = 50000

local function postPayload(payloadTable)
    local payload = HttpService:JSONEncode(payloadTable)
    local ok, err = pcall(function()
        HttpService:PostAsync(getEndpoint(), payload, Enum.HttpContentType.ApplicationJson)
    end)

    if not ok then
        warn(`[ProgressionReportWatcher] failed to post progression report: {err}`)
    end

    return ok
end

local function postReport(content)
    if content == nil or content == "" then
        return
    end

    task.defer(function()
        local length = string.len(content)
        if length <= MAX_CHUNK_SIZE then
            postPayload({
                content = content,
            })
            return
        end

        local startIndex = 1
        local chunkIndex = 0

        while startIndex <= length do
            local endIndex = math.min(startIndex + MAX_CHUNK_SIZE - 1, length)
            local chunk = string.sub(content, startIndex, endIndex)
            local isFirst = chunkIndex == 0
            local isLast = endIndex >= length

            local success = postPayload({
                chunk = chunk,
                isFirst = isFirst,
                isLast = isLast,
            })

            if not success then
                break
            end

            startIndex = endIndex + 1
            chunkIndex += 1

            if not isLast then
                task.wait()
            end
        end
    end)
end

local function sendIfChanged(valueObject)
    if not valueObject:IsA("StringValue") then
        return
    end

    local current = valueObject.Value
    if lastSentPerValue[valueObject] == current then
        return
    end

    lastSentPerValue[valueObject] = current
    postReport(current)
end

local function watchValue(valueObject)
    if not valueObject:IsA("StringValue") then
        return
    end

    sendIfChanged(valueObject)

    local changedConnection
    changedConnection = valueObject:GetPropertyChangedSignal("Value"):Connect(function()
        sendIfChanged(valueObject)
    end)

    valueObject.Destroying:Connect(function()
        if changedConnection then
            changedConnection:Disconnect()
            changedConnection = nil
        end
        lastSentPerValue[valueObject] = nil
    end)
end

local existing = workspace:FindFirstChild("ProgressionEstimationReport")
if existing and existing:IsA("StringValue") then
    watchValue(existing)
end

workspace.ChildAdded:Connect(function(child)
    if child.Name == "ProgressionEstimationReport" and child:IsA("StringValue") then
        watchValue(child)
    end
end)
