--!nocheck
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local mockFlamework = require(ReplicatedStorage.shared.hamster.mockFlamework).default

local cleanup = mockFlamework()

local PRINT_CHUNK_SIZE = 7000

local function chunkedPrint(message)
    local text = (typeof(message) == "string") and message or tostring(message)
    local length = string.len(text)
    local index = 1

    while index <= length do
        local chunk = string.sub(text, index, index + PRINT_CHUNK_SIZE - 1)
        print(chunk)
        index += PRINT_CHUNK_SIZE
    end
end

rawset(_G, "ProgressEstimated", function(message)
    chunkedPrint(message)
end)


local estimate = rawget(_G, "EstimateProgress")
if not estimate then
    error("EstimateProgress function not found in global scope.")
end

estimate()
cleanup()