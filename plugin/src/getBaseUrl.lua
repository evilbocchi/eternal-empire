-- Gets the base URL for the local tooling server
local function getBaseUrl()
    local port = workspace:GetAttribute("ToolingPort") or 28354
    return string.format("http://localhost:%d", port)
end

return getBaseUrl