local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local INTERVAL = 5 -- seconds between syncs
local MAX_DEPTH = 3
local MAX_NODES = 6000

local function getEndpoint()
    local currentPort = workspace:GetAttribute("WaypointSyncPort") or 28354
    return `http://localhost:{currentPort}/data-model`
end

local function buildPath(parentPath, childName)
    if parentPath == "" then
        return childName
    end

    if parentPath == "game" then
        return `game.{childName}`
    end

    return `{parentPath}.{childName}`
end

local function captureDataModel()
    local nodeCount = 0
    local truncated = false

    local function serialize(instance, depth, path)
        if nodeCount >= MAX_NODES then
            truncated = true
            return nil
        end

        nodeCount += 1

        local displayName = instance == game and "game" or instance.Name
        local node = {
            name = displayName,
            className = instance.ClassName,
            path = path,
        }

        local children = instance:GetChildren()
        node.totalChildren = #children
        if depth >= MAX_DEPTH then
            if #children > 0 then
                node.truncated = true
                node.childCount = #children
            end
            if truncated then
                node.truncated = true
            end
            return node
        end

        if #children == 0 then
            if truncated then
                node.truncated = true
            end
            return node
        end

        local serializedChildren = {}
        for _, child in ipairs(children) do
            if nodeCount >= MAX_NODES then
                truncated = true
                break
            end

            local childPath = buildPath(path, child.Name)
            local childNode = serialize(child, depth + 1, childPath)
            if childNode then
                table.insert(serializedChildren, childNode)
            end
        end

        node.childCount = #serializedChildren
        if #serializedChildren > 0 then
            node.children = serializedChildren
        end

        if truncated then
            node.truncated = true
        end

        return node
    end

    local root = serialize(game, 0, "game")
    if not root then
        return nil
    end

    return {
        root = root,
        truncated = truncated,
        maxDepth = MAX_DEPTH,
        maxNodes = MAX_NODES,
        generatedAt = os.time(),
    }
end

local lastSend = tick() + 3
local connection

local function sendSnapshot()
    local payload = captureDataModel()
    if not payload then
        return
    end

    local ok, encoded = pcall(function()
        return HttpService:JSONEncode(payload)
    end)

    if not ok then
        warn("[DataModelSyncer] Failed to encode data model payload")
        return
    end

    task.spawn(function()
        local success, err = pcall(function()
            HttpService:PostAsync(getEndpoint(), encoded, Enum.HttpContentType.ApplicationJson)
        end)

        if not success then
            warn(`[DataModelSyncer] Failed to post data model: {err}`)
        end
    end)
end

connection = RunService.Heartbeat:Connect(function()
    if tick() - lastSend >= INTERVAL then
        sendSnapshot()
        lastSend = tick()
    end
end)

plugin.Unloading:Connect(function()
    if connection then
        connection:Disconnect()
    end
end)
