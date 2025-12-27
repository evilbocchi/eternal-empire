local HttpService = game:GetService("HttpService")
local getBaseUrl = require(script.Parent.getBaseUrl)

local MAX_CHUNK_SIZE = 50000

local function postPayload(payloadTable)
    local payload = HttpService:JSONEncode(payloadTable)
    local ok, err = pcall(function()
        HttpService:PostAsync(getBaseUrl() .. "/progression-report", payload, Enum.HttpContentType.ApplicationJson)
    end)

    if not ok then
        warn(`Failed to post progression report: {err}`)
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

_G.ProgressEstimated = postReport