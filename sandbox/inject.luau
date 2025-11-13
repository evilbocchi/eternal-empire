local fs = require("@lune/fs")
local roblox = require("@lune/roblox")

local localGame = roblox.deserializePlace(fs.readFile("sandbox/local.rbxl"))
local upstreamGame = roblox.deserializePlace(fs.readFile("sandbox/upstream.rbxl"))

for _, item in ipairs(upstreamGame.Workspace:GetChildren()) do
    if item.Name == "Terrain" or item.Name == "Camera" then
        continue
    end
    item:Clone().Parent = localGame.Workspace
end

upstreamGame.ReplicatedStorage.Assets:Clone().Parent = localGame.ReplicatedStorage

file = roblox.serializePlace(localGame)
fs.writeFile("sandbox/local.rbxl", file)