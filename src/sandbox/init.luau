--!nocheck
local fs = require("@lune/fs")
local roblox = require("@lune/roblox")
local Instance = roblox.Instance
local Enum = roblox.Enum
local Color3 = roblox.Color3
local Vector3 = roblox.Vector3
local CFrame = roblox.CFrame

local game = roblox.deserializePlace(fs.readFile("out/local.rbxl"))
local workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

ReplicatedStorage.ItemModels.Parent = workspace

local waypoints = Instance.new("Folder")
waypoints.Name = "Waypoints"
waypoints.Parent = workspace

local sandboxIndicator = Instance.new("BoolValue")
sandboxIndicator.Name = "SANDBOX"
sandboxIndicator.Value = true
sandboxIndicator:SetAttribute("Id", "SANDBOX")
sandboxIndicator.Parent = workspace

local baseplate = Instance.new("Part")
baseplate.Color = Color3.fromRGB(91, 91, 91)
baseplate.Size = Vector3.new(2046, 16, 2046)
baseplate.CFrame = CFrame.new(0, -8, 0)
baseplate.Anchored = true
baseplate.CanCollide = true
baseplate.CollisionGroup = "Item"
baseplate.TopSurface = Enum.SurfaceType.Smooth
baseplate.BottomSurface = Enum.SurfaceType.Smooth
baseplate.Name = "Baseplate"
baseplate.Parent = workspace

local texture = Instance.new("Texture")
texture.Face = Enum.NormalId.Top
texture.StudsPerTileU = 24
texture.StudsPerTileV = 24
texture.Texture = "rbxassetid://6917846451"
texture.Transparency = 0.8
texture.Parent = baseplate

fs.writeFile("out/sandbox.rbxl", roblox.serializePlace(game))
