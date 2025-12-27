_G.EELogs = _G.EELogs or {}

local function log(...)
    if _G.EELogs == nil then
        _G.EELogs = {}
    end
    table.insert(_G.EELogs, ...)
end

return log
