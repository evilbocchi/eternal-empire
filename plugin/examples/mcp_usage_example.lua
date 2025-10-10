--[[
    Example: Using MCP HTTP Client from Studio
    
    This example demonstrates how to use the MCPClient to query the DataModel
    from within Roblox Studio using the HTTP streaming API.
]]

local HttpService = game:GetService("HttpService")
local Workspace = game:GetService("Workspace")

-- Helper to call MCP tools
local function callMcpTool(toolName, arguments)
    local port = Workspace:GetAttribute("ToolingPort") or 28354
    local url = string.format("http://localhost:%d/mcp/call-tool", port)
    
    local payload = {
        name = toolName,
        arguments = arguments or {},
    }
    
    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json",
            },
            Body = HttpService:JSONEncode(payload),
        })
    end)
    
    if not success then
        warn("MCP call failed:", result)
        return nil
    end
    
    if result.Success then
        local decoded = HttpService:JSONDecode(result.Body)
        return decoded.result
    else
        warn("MCP returned error:", result.StatusCode)
        return nil
    end
end

-- Example 1: List instances in Workspace
print("=== Example 1: List Workspace Instances ===")
local workspaceResult = callMcpTool("list_instances", {
    path = "game.Workspace",
    maxDepth = 2
})

if workspaceResult then
    print("Path:", workspaceResult.path)
    print("Node:", workspaceResult.node.name, "(" .. workspaceResult.node.className .. ")")
    if workspaceResult.node.children then
        print("Children count:", #workspaceResult.node.children)
        for i = 1, math.min(5, #workspaceResult.node.children) do
            local child = workspaceResult.node.children[i]
            print("  -", child.name, "(" .. child.className .. ")")
        end
    end
end

-- Example 2: Find an item model
print("\n=== Example 2: Find Item Model ===")
local itemResult = callMcpTool("find_item_model", {
    itemName = "Conveyor",
    maxDepth = 3
})

if itemResult then
    print("Item found at:", itemResult.path)
    print("Model:", itemResult.model.name, "(" .. itemResult.model.className .. ")")
    if itemResult.model.children then
        print("Parts in model:", #itemResult.model.children)
    end
else
    print("Item not found. Available in ItemModels folder?")
end

-- Example 3: Query ReplicatedStorage
print("\n=== Example 3: Query ReplicatedStorage ===")
local storageResult = callMcpTool("list_instances", {
    path = "game.ReplicatedStorage",
    maxDepth = 1
})

if storageResult then
    print("ReplicatedStorage contains", #(storageResult.node.children or {}), "top-level items")
end

print("\n=== Examples Complete ===")
