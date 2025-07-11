--!native

local RemoteFunc = {}
RemoteFunc.__index = RemoteFunc

function RemoteFunc.new()
	local self = setmetatable({}, RemoteFunc)
	self.remoteFunction = Instance.new("RemoteFunction")
	return self
end

function RemoteFunc.is(obj: any)
	return type(obj) == "table" and getmetatable(obj) == RemoteFunc
end

function RemoteFunc:onInvoke(fn)
	self.remoteFunction.OnServerInvoke = fn
end

function RemoteFunc:invoke(player: Player, ...: any)
	self.remoteFunction:InvokeClient(player, ...)
end

function RemoteFunc:destroy()
	self.remoteFunction:Destroy()
end

return RemoteFunc