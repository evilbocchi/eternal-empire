--!nocheck
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local manuallyIgniteFlamework = require(ReplicatedStorage.shared.hamster.manuallyIgniteFlamework).default

local cleanup = manuallyIgniteFlamework().cleanup

local PRINT_CHUNK_SIZE = 7000
local REPORT_BEGIN_MARKER = "__PROGRESSION_ESTIMATE_BEGIN__"
local REPORT_END_MARKER = "__PROGRESSION_ESTIMATE_END__"

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
    chunkedPrint(REPORT_BEGIN_MARKER)
    chunkedPrint(message)
    chunkedPrint(REPORT_END_MARKER)
end)


local estimate = rawget(_G, "EstimateProgress")
if not estimate then
    error("EstimateProgress function not found in global scope.")
end

estimate()
cleanup()