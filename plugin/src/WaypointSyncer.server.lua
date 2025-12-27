local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local getBaseUrl = require(script.Parent.getBaseUrl)

local INTERVAL = 2 -- seconds

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


local function sendInstanceTree()
    local waypoints = game:GetService("Workspace"):FindFirstChild("Waypoints")
    if not waypoints then
        return
    end

    -- Check if waypoints has any children
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
            }
        }
    }

    if RunService:IsRunning() then
        return -- only send when not running
    end

    local json = HttpService:JSONEncode(trees)
    pcall(function()
        HttpService:PostAsync(getBaseUrl() .. "/waypointsync", json, Enum.HttpContentType.ApplicationJson)
    end)
end

local lastSend = tick() + 5 -- small delay after connecting to dev server
local connection = nil
task.spawn(function()
    if RunService:IsRunning() then
        return -- only run in studio
    end
	connection = RunService.Heartbeat:Connect(function()
		if  tick() - lastSend >= INTERVAL then
			sendInstanceTree()
			lastSend = tick()
		end
	end)
end)

plugin.Unloading:Connect(function()
	if connection then
		connection:Disconnect()
	end
end)