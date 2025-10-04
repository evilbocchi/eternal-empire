local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local INTERVAL = 5 -- seconds between syncs
local MAX_DEPTH = 6
local MAX_NODES = 12000
local SNAPSHOT_INLINE_LIMIT = 200000 -- maximum encoded payload size before chunking (bytes)
local SNAPSHOT_CHUNK_SIZE = 200000 -- chunk size for large snapshots

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

    -- Only include these top-level services
    local ALLOWED_SERVICES = {
        Workspace = true,
        Players = true,
        Lighting = true,
        MaterialService = true,
        ReplicatedFirst = true,
        ReplicatedStorage = true,
        ServerScriptService = true,
        ServerStorage = true,
        StarterGui = true,
        StarterPack = true,
        StarterPlayer = true,
        Teams = true,
        SoundService = true,
        TextChatService = true,
    }

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
            -- Ignore any folders named "TS"
            if (child.ClassName == "Folder" or child.ClassName == "Actor") and child.Name == "TS" then
                continue
            end
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

    -- Custom root serialization: only include allowed services
    local root = {
        name = "game",
        className = "DataModel",
        path = "game",
        children = {},
        childCount = 0,
        totalChildren = 0,
    }
    local allowedChildren = {}
    for _, child in ipairs(game:GetChildren()) do
        if ALLOWED_SERVICES[child.Name] then
            local childNode = serialize(child, 1, buildPath("game", child.Name))
            if childNode then
                table.insert(allowedChildren, childNode)
            end
        end
    end
    root.children = allowedChildren
    root.childCount = #allowedChildren
    root.totalChildren = #allowedChildren

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

local function nodesDiffer(a, b)
    if a == b then
        return false
    end

    if not a or not b then
        return true
    end

    if a.path ~= b.path or a.name ~= b.name or a.className ~= b.className then
        return true
    end

    local aTruncated = a.truncated == true
    local bTruncated = b.truncated == true
    if aTruncated ~= bTruncated then
        return true
    end

    if (a.childCount or 0) ~= (b.childCount or 0) then
        return true
    end

    if (a.totalChildren or 0) ~= (b.totalChildren or 0) then
        return true
    end

    return false
end

local function getPathDepth(path)
    local depth = 1
    if typeof(path) ~= "string" then
        return depth
    end

    for _ in string.gmatch(path, "%.") do
        depth += 1
    end

    return depth
end

local function computeChanges(newRoot, oldRoot)
    if not newRoot or not oldRoot then
        return {}
    end

    local results = {}
    local seen = {}

    local function append(node)
        local path = node and node.path
        if path and not seen[path] then
            table.insert(results, node)
            seen[path] = true
        end
    end

    local function toMap(children)
        local map = {}
        if not children then
            return map
        end

        for _, child in ipairs(children) do
            if child.path then
                map[child.path] = child
            end
        end

        return map
    end

    local function compare(newNode, oldNode)
        if not oldNode then
            append(newNode)
            return true
        end

        if nodesDiffer(newNode, oldNode) then
            append(newNode)
            return true
        end

        local newChildren = newNode.children
        local oldChildren = oldNode.children

        if not newChildren or #newChildren == 0 then
            if oldChildren and #oldChildren > 0 then
                append(newNode)
                return true
            end

            return false
        end

        if not oldChildren or #oldChildren == 0 then
            append(newNode)
            return true
        end

        local oldMap = toMap(oldChildren)
        local newChildSet = {}

        for _, child in ipairs(newChildren) do
            newChildSet[child.path] = true
            local previous = oldMap[child.path]
            if not previous then
                append(newNode)
                return true
            end

            compare(child, previous)
        end

        for _, previous in ipairs(oldChildren) do
            if not newChildSet[previous.path] then
                append(newNode)
                return true
            end
        end

        return false
    end

    compare(newRoot, oldRoot)

    if #results > 1 then
        table.sort(results, function(a, b)
            return getPathDepth(a.path) < getPathDepth(b.path)
        end)
    end

    return results
end

local syncState = {
    confirmedSnapshot = nil,
    confirmedEnvelope = nil,
    confirmedVersion = nil,
    awaitingResponse = false,
    pending = nil,
    needsSnapshot = true,
}

local function markNeedsSnapshot()
    syncState.needsSnapshot = true
    syncState.confirmedSnapshot = syncState.confirmedSnapshot
end

local function handleResponse(decoded, pending)
    if typeof(decoded) ~= "table" then
        warn("[DataModelSyncer] Received malformed response from MCP server")
        markNeedsSnapshot()
        return
    end

    local status = decoded.status
    if status == "ok" then
        local version = decoded.version
        if typeof(version) ~= "number" then
            warn("[DataModelSyncer] MCP server response missing version")
            markNeedsSnapshot()
            return
        end

        if pending and pending.capture then
            syncState.confirmedSnapshot = pending.capture.root
            syncState.confirmedEnvelope = pending.capture
        end

        syncState.confirmedVersion = version
        syncState.needsSnapshot = false
    elseif status == "resync" then
        if decoded.message then
            warn(`[DataModelSyncer] MCP server requested resync: {decoded.message}`)
        else
            warn("[DataModelSyncer] MCP server requested resync")
        end

        if typeof(decoded.version) == "number" then
            syncState.confirmedVersion = decoded.version
        else
            syncState.confirmedVersion = nil
        end

        syncState.confirmedSnapshot = nil
        syncState.confirmedEnvelope = nil
        syncState.needsSnapshot = true
    else
        local message = decoded.message or "Unexpected response"
        warn(`[DataModelSyncer] MCP server returned {status or "unknown"}: {message}`)
        if pending and pending.type ~= "snapshot" then
            markNeedsSnapshot()
        end
    end
end

local function dispatch(payload, pending)
    local ok, encoded = pcall(function()
        return HttpService:JSONEncode(payload)
    end)

    if not ok then
        warn("[DataModelSyncer] Failed to encode data model payload")
        return
    end

    syncState.awaitingResponse = true
    syncState.pending = pending

    task.spawn(function()
        local success, result = pcall(function()
            return HttpService:RequestAsync({
                Url = getEndpoint(),
                Method = "POST",
                Headers = {
                    ["Content-Type"] = "application/json",
                },
                Body = encoded,
            })
        end)

        if not success then
            local msg = tostring(result)
            if not (msg:find("HttpError: ConnectFail")) then
                warn(`[DataModelSyncer] Failed to post data model: {result}`)
            end
            syncState.awaitingResponse = false
            syncState.pending = nil
            if pending and pending.type ~= "snapshot" then
                markNeedsSnapshot()
            end
            return
        end

        if not result.Success then
            warn(`[DataModelSyncer] DataModel request failed (status {result.StatusCode})`)
            syncState.awaitingResponse = false
            syncState.pending = nil
            if pending and pending.type ~= "snapshot" then
                markNeedsSnapshot()
            end
            return
        end

        local decodeOk, decoded = pcall(function()
            return HttpService:JSONDecode(result.Body)
        end)

        if not decodeOk then
            warn("[DataModelSyncer] Failed to decode MCP server response")
            syncState.awaitingResponse = false
            syncState.pending = nil
            if pending and pending.type ~= "snapshot" then
                markNeedsSnapshot()
            end
            return
        end

        local handled = false
        if pending and pending.handler then
            local handlerOk, handlerResult = pcall(pending.handler, decoded, pending)
            if not handlerOk then
                warn(`[DataModelSyncer] Payload handler failed: {handlerResult}`)
                markNeedsSnapshot()
                handled = true
            else
                handled = handlerResult == true
            end
        end

        if not handled then
            handleResponse(decoded, pending)
        end

        syncState.awaitingResponse = false
        syncState.pending = nil
    end)
end

local function sendSnapshotChunks(capture, encoded)
    local chunkSize = SNAPSHOT_CHUNK_SIZE
    if chunkSize <= 0 then
        return false
    end

    local totalChunks = math.ceil(string.len(encoded) / chunkSize)
    if totalChunks <= 1 then
        return false
    end

    local chunkId = HttpService:GenerateGUID(false)
    local pending

    local function buildPayload(index)
        local startIndex = ((index - 1) * chunkSize) + 1
        local endIndex = math.min(#encoded, startIndex + chunkSize - 1)
        local chunk = string.sub(encoded, startIndex, endIndex)

        return {
            type = "snapshot-chunk",
            chunkId = chunkId,
            chunkIndex = index,
            chunkCount = totalChunks,
            chunk = chunk,
        }
    end

    local function sendChunk(index)
        pending.chunk.index = index
        dispatch(buildPayload(index), pending)
    end

    pending = {
        type = "snapshot",
        capture = capture,
        chunk = {
            id = chunkId,
            total = totalChunks,
            index = 0,
        },
    }

    pending.handler = function(decoded, pendingRef)
        local status = decoded.status
        if status == "chunk-ack" then
            local nextIndex = pendingRef.chunk.index + 1
            if nextIndex <= pendingRef.chunk.total then
                task.defer(function()
                    sendChunk(nextIndex)
                end)
            else
                warn("[DataModelSyncer] Received chunk acknowledgement beyond final chunk")
                markNeedsSnapshot()
            end

            return true
        end

        return false
    end

    sendChunk(1)

    return true
end

local function sendSnapshot(capture)
    if not capture then
        return
    end

    local snapshotPayload = {
        type = "snapshot",
        snapshot = capture.root,
        truncated = capture.truncated,
        maxDepth = capture.maxDepth,
        maxNodes = capture.maxNodes,
        generatedAt = capture.generatedAt,
    }

    local encodeOk, encodedSnapshot = pcall(function()
        return HttpService:JSONEncode(snapshotPayload)
    end)

    if not encodeOk then
        warn(`[DataModelSyncer] Failed to prepare snapshot payload: {encodedSnapshot}`)
        return
    end

    if string.len(encodedSnapshot) > SNAPSHOT_INLINE_LIMIT then
        if sendSnapshotChunks(capture, encodedSnapshot) then
            return
        end
    end

    dispatch(snapshotPayload, {
        type = "snapshot",
        capture = capture,
    })
end

local function sendDiff(capture)
    if not capture or not syncState.confirmedSnapshot or not syncState.confirmedVersion then
        return false
    end

    local changes = computeChanges(capture.root, syncState.confirmedSnapshot)
    if #changes == 0 then
        return false
    end

    dispatch({
        type = "diff",
        baseVersion = syncState.confirmedVersion,
        truncated = capture.truncated,
        maxDepth = capture.maxDepth,
        maxNodes = capture.maxNodes,
        generatedAt = capture.generatedAt,
        changes = changes,
    }, {
        type = "diff",
        capture = capture,
    })

    return true
end

local lastSend = tick() + 3
local connection

connection = RunService.Heartbeat:Connect(function()
    if syncState.awaitingResponse then
        return
    end

    local now = tick()
    if now - lastSend < INTERVAL then
        return
    end

    local capture = captureDataModel()
    if not capture then
        lastSend = now
        return
    end

    if capture.truncated or syncState.needsSnapshot or not syncState.confirmedSnapshot or not syncState.confirmedVersion then
        sendSnapshot(capture)
        lastSend = now
        return
    end

    local sentDiff = sendDiff(capture)
    if sentDiff then
        lastSend = now
    else
        lastSend = now
    end
end)

plugin.Unloading:Connect(function()
    if connection then
        connection:Disconnect()
    end
end)
