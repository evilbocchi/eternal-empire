local Players = game:GetService("Players")

local RemoteSignal = {}
RemoteSignal.__index = RemoteSignal

function RemoteSignal.new(parent: Instance, name: string, unreliable: boolean?)
	local self = setmetatable({}, RemoteSignal)
	self.remoteEvent = if unreliable == true then Instance.new("UnreliableRemoteEvent") else Instance.new("RemoteEvent")
	return self
end

function RemoteSignal.is(obj: any)
	return type(obj) == "table" and getmetatable(obj) == RemoteSignal
end

function RemoteSignal:isUnreliable(): boolean
	return self.remoteEvent:IsA("UnreliableRemoteEvent")
end

function RemoteSignal:connect(fn)
	return self.remoteEvent.OnServerEvent:Connect(fn)
end

function RemoteSignal:fire(player: Player, ...: any)
	self.remoteEvent:FireClient(player, ...)
end

function RemoteSignal:fireAll(...: any)
	self.remoteEvent:FireAllClients(...)
end

function RemoteSignal:fireExcept(ignorePlayer: Player, ...: any)
	self:fireFilter(function(plr)
		return plr ~= ignorePlayer
	end, ...)
end

function RemoteSignal:fireFilter(predicate: (Player, ...any) -> boolean, ...: any)
	for _, player in Players:GetPlayers() do
		if predicate(player, ...) then
			self.remoteEvent:FireClient(player, ...)
		end
	end
end

function RemoteSignal:fireFor(players: { Player }, ...: any)
	for _, player in players do
		self.remoteEvent:FireClient(player, ...)
	end
end

function RemoteSignal:destroy()
	self.remoteEvent:Destroy()
end

return RemoteSignal